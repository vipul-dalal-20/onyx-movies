/* eslint-disable no-undef */
/**
 * Onyx Proxy Worker v3
 * - Open proxy (no domain allowlist)
 * - Built-in ad + popup blocker
 * - Strips X-Frame-Options / CSP
 *
 * Deploy: npx wrangler deploy  (from proxy-worker/)
 */

// ── Ad / tracker / popup domains to block ────────────────────────────────────
const AD_DOMAINS = new Set([
  // Ad networks
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'adnxs.com', 'amazon-adsystem.com', 'adsrvr.org',
  // Streaming site ad networks
  'exoclick.com', 'juicyads.com', 'trafficjunky.net', 'trafficstars.com',
  'ero-advertising.com', 'adspyglass.com', 'plugrush.com', 'tsyndicate.com',
  'clickaine.com', 'adcash.com', 'hilltopads.com', 'propellerads.com',
  'richpush.co', 'pushground.com', 'mgid.com', 'bidvertiser.com',
  // Popup / popunder
  'popads.net', 'popcash.net', 'popunder.ru', 'adsterra.com',
  'monetizer101.com', 'onclicka.com', 'onclick.io', 'onclkds.com',
  'go2speed.org', 'clkmon.com', 'cltrack.com', 'clkrev.com',
  // Trackers
  'hotjar.com', 'clarity.ms', 'mouseflow.com', 'fullstory.com',
  'mixpanel.com', 'segment.io', 'segment.com',
  // Crypto miners
  'coinhive.com', 'minero.cc', 'jsecoin.com',
  // Blocked CDNs (block proxy IP)
  'vsembed.ru',
]);

const isAdDomain = (hostname) => {
  if (!hostname) return false;
  for (const ad of AD_DOMAINS) {
    if (hostname === ad || hostname.endsWith('.' + ad)) return true;
  }
  return false;
};

// ── Popup blocker script injected into every proxied page ────────────────────
const POPUP_BLOCKER_SCRIPT = `<script>
(function() {
  // Block window.open popups
  var _open = window.open;
  window.open = function(url, name, features) {
    if (!url || url === '' || url === 'about:blank') return null;
    // Allow internal player windows (same-ish domain), block everything else
    return null;
  };

  // Block location redirects via setter
  try {
    var _href = Object.getOwnPropertyDescriptor(window.location, 'href');
    if (_href && _href.set) {
      Object.defineProperty(window.location, 'href', {
        set: function(v) {
          // Block obvious ad redirects
          if (v && (v.includes('click') || v.includes('pop') || v.includes('redirect'))) return;
          _href.set.call(window.location, v);
        },
        get: _href.get,
      });
    }
  } catch(e) {}

  // Remove ad iframes that appear after load
  var _observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeName === 'IFRAME' || node.nodeName === 'SCRIPT') {
          var src = node.src || node.getAttribute('src') || '';
          var adPatterns = ['ads','click','pop','banner','doubleclick','exoclick','propeller','adsterra'];
          if (adPatterns.some(function(p) { return src.toLowerCase().includes(p); })) {
            node.remove();
          }
        }
      });
    });
  });
  _observer.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>`;

// ─────────────────────────────────────────────────────────────────────────────

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // ── CORS Preflight ──────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    // ── Health check ────────────────────────────────────────────────────────
    if (url.pathname === '/' && !url.searchParams.has('url')) {
      return new Response(
        JSON.stringify({ status: 'ok', service: 'Onyx Proxy Worker', version: '3.0', adBlock: true }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ── Extract target URL ──────────────────────────────────────────────────
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response('Missing ?url= parameter', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    let targetParsed;
    try {
      targetParsed = new URL(targetUrl);
    } catch {
      return new Response('Invalid target URL', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    // ── Only allow http/https ───────────────────────────────────────────────
    if (!['http:', 'https:'].includes(targetParsed.protocol)) {
      return new Response('Only http/https targets allowed', {
        status: 403,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    // ── AD BLOCKER: return empty response for ad/tracker domains ───────────
    if (isAdDomain(targetParsed.hostname)) {
      const ct = targetUrl.endsWith('.js') || targetUrl.includes('.js?') ? 'application/javascript' : 'text/plain';
      return new Response('', {
        status: 200,
        headers: { 'Content-Type': ct, 'Access-Control-Allow-Origin': '*' },
      });
    }

    const proxyBase = `${url.origin}/?url=`;

    const makeProxied = (href, base) => {
      if (!href) return href;
      if (
        href.startsWith('data:') ||
        href.startsWith('blob:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#') ||
        href.startsWith('mailto:')
      ) return href;
      try {
        const absolute = new URL(href, base).href;
        const parsed = new URL(absolute);
        // Block ad domains at HTML-rewrite level too (return a dead URL)
        if (isAdDomain(parsed.hostname)) return 'about:blank';
        return proxyBase + encodeURIComponent(absolute);
      } catch {
        return href;
      }
    };

    // ── Fetch the target ────────────────────────────────────────────────────
    const forwardHeaders = new Headers();
    const headersToIgnore = [
      'host',
      'cf-connecting-ip',
      'cf-ipcountry',
      'cf-ray',
      'cf-visitor',
      'connection',
      'cdn-loop',
      'x-forwarded-for',
      'x-real-ip',
      'referer',
      'origin',
    ];
    for (const [key, value] of request.headers.entries()) {
      if (!headersToIgnore.includes(key.toLowerCase())) {
        forwardHeaders.set(key, value);
      }
    }
    // Set matching Referer and Origin for the target to bypass basic hotlink protections
    forwardHeaders.set('Referer', targetParsed.origin + '/');
    forwardHeaders.set('Origin', targetParsed.origin);
    // User-agent fallback if not provided
    if (!forwardHeaders.has('user-agent')) {
      forwardHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    }

    const requestBody = ['GET', 'HEAD'].includes(request.method) ? null : await request.arrayBuffer();

    let targetResp;
    try {
      targetResp = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
        body: requestBody,
        redirect: 'follow',
      });
    } catch (err) {
      return new Response(`Upstream fetch failed: ${err.message}`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const contentType = targetResp.headers.get('content-type') || 'application/octet-stream';

    // ── Strip blocking headers ──────────────────────────────────────────────
    const respHeaders = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store',
    });

    // ── HTML: rewrite URLs + inject ad blocker + fetch interceptor ──────────
    if (contentType.includes('text/html')) {
      const rewriter = new HTMLRewriter()
        .on('base', { element: (el) => el.remove() })

        // Remove known ad script tags outright
        .on('script[src]', {
          element: (el) => {
            const src = el.getAttribute('src') || '';
            try {
              const parsed = new URL(src, targetUrl);
              if (isAdDomain(parsed.hostname)) { el.remove(); return; }
            } catch { /* relative URL, keep */ }
            el.setAttribute('src', makeProxied(src, targetUrl));
          },
        })
        // Remove inline scripts that are obviously ad scripts (by common patterns)
        // Keep these — they're player scripts. We can't easily inspect inline content.
        .on('link[href]', {
          element: (el) => {
            const rel = el.getAttribute('rel') || '';
            if (rel.includes('preconnect') || rel.includes('dns-prefetch')) { el.remove(); return; }
            el.setAttribute('href', makeProxied(el.getAttribute('href'), targetUrl));
          },
        })
        .on('img[src]', {
          element: (el) => el.setAttribute('src', makeProxied(el.getAttribute('src'), targetUrl)),
        })
        .on('source[src]', {
          element: (el) => el.setAttribute('src', makeProxied(el.getAttribute('src'), targetUrl)),
        })
        .on('video[src]', {
          element: (el) => el.setAttribute('src', makeProxied(el.getAttribute('src'), targetUrl)),
        })
        .on('iframe[src]', {
          element: (el) => {
            const src = el.getAttribute('src') || '';
            try {
              const parsed = new URL(src, targetUrl);
              if (isAdDomain(parsed.hostname)) { el.remove(); return; }
            } catch {
              // Ignore invalid URLs
            }
            el.setAttribute('src', makeProxied(src, targetUrl));
          },
        })
        .on('form[action]', {
          element: (el) => el.setAttribute('action', makeProxied(el.getAttribute('action'), targetUrl)),
        })
        // Inject popup blocker + fetch interceptor as the very first thing in <head>
        .on('head', {
          element: (el) => {
            el.prepend(POPUP_BLOCKER_SCRIPT, { html: true });
            el.prepend(
              `<script>
(function() {
  var PROXY = ${JSON.stringify(proxyBase)};
  var TARGET = ${JSON.stringify(targetParsed.origin)};

  function proxify(u) {
    if (!u || u.startsWith('data:') || u.startsWith('blob:')) return u;
    try {
      var abs = u.startsWith('/') ? TARGET + u : new URL(u, TARGET).href;
      if (abs.startsWith(TARGET)) return PROXY + encodeURIComponent(abs);
    } catch(e) {}
    return u;
  }

  var _fetch = window.fetch;
  window.fetch = function(input, init) {
    var u = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));
    var p = proxify(u);
    if (p !== u) input = p;
    return _fetch.call(this, input, init);
  };

  var _open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, u) {
    var p = proxify(u);
    var args = Array.prototype.slice.call(arguments);
    args[1] = p;
    return _open.apply(this, args);
  };
})();
</script>`,
              { html: true }
            );
          },
        });

      return rewriter.transform(new Response(targetResp.body, { headers: respHeaders }));
    }

    // ── JS: rewrite same-origin string literals ─────────────────────────────
    if (contentType.includes('javascript')) {
      let js = await targetResp.text();
      const origin = targetParsed.origin;
      js = js.replace(
        new RegExp('(["`\'])((' + escapeRegex(origin) + ')/[^"\'`\\s]*)\\1', 'g'),
        (_, q, u) => `${q}${proxyBase}${encodeURIComponent(u)}${q}`
      );
      return new Response(js, { headers: respHeaders });
    }

    // ── CSS: rewrite url() ──────────────────────────────────────────────────
    if (contentType.includes('text/css')) {
      let css = await targetResp.text();
      const origin = targetParsed.origin;
      css = css.replace(/url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/g, (_, u) =>
        `url("${proxyBase}${encodeURIComponent(u)}")`
      );
      css = css.replace(/url\(['"]?(\/[^'")\s]+)['"]?\)/g, (_, path) =>
        `url("${proxyBase}${encodeURIComponent(origin + path)}")`
      );
      return new Response(css, { headers: respHeaders });
    }

    // ── Everything else: pipe through ───────────────────────────────────────
    return new Response(targetResp.body, {
      status: targetResp.status,
      headers: respHeaders,
    });
  },
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
