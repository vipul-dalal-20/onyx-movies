import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, isAdultOrMature } from '../services/tmdb';
import { useSettings } from '../hooks/useSettings';
import MovieRow from '../components/MovieRow';

const IMG_BASE = 'https://image.tmdb.org/t/p';
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'https://onyx-proxy.onyx-movies.workers.dev';

// ── Servers ───────────────────────────────────────────────────────────────────
const SERVERS = [
  {
    name: 'VidLink',
    label: 'Server 1',
    url: (id, type, s, e) =>
      type === 'movie'
        ? `https://vidlink.pro/movie/${id}?autoplay=true&primaryColor=a855f7&multiLang=true`
        : `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&primaryColor=a855f7&multiLang=true`,
  },
  {
    name: 'Vidsrc.to',
    label: 'Server 2',
    url: (id, type, s, e) =>
      type === 'movie'
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'MoviesAPI',
    label: 'Server 3',
    url: (id, type, s, e) =>
      type === 'movie'
        ? `https://moviesapi.club/movie/${id}`
        : `https://moviesapi.club/tv/${id}-${s}-${e}`,
  },
  {
    name: '2embed',
    label: 'Server 4',
    url: (id, type, s, e) =>
      type === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    name: 'VidSrc Multi',
    label: 'Server 5',
    url: (id, type, s, e) =>
      type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&sea=${s}&epi=${e}`,
  },
  {
    name: 'AutoEmbed',
    label: 'Server 6',
    url: (id, type, s, e) =>
      type === 'movie'
        ? `https://player.autoembed.cc/embed/movie/${id}`
        : `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'EmbedSu',
    label: 'Server 7',
    url: (id, type, s, e) =>
      type === 'movie'
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const InteractivePlayer = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'movie';
  const { includeAdult } = useSettings();

  // TV show episode selectors
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(true);
  const [useProxy, setUseProxy] = useState(() => {
    try {
      return localStorage.getItem('onyx_player_use_proxy') === 'true';
    } catch {
      return false;
    }
  });

  const handleProxyToggle = () => {
    setUseProxy(prev => {
      const newVal = !prev;
      try {
        localStorage.setItem('onyx_player_use_proxy', String(newVal));
      } catch {
        // ignore storage block
      }
      setIframeKey(k => k + 1); // reload iframe
      return newVal;
    });
  };

  const playerContainerRef = useRef(null);
  // Track iframe load timeout — only auto-switch if truly stuck (30s)
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Guard against iframe ad scripts attempting to hijack or redirect the top window
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      return (e.returnValue = '');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setActiveServer(0);
    setMovie(null);
    setIframeLoaded(false);

    const fetchMovie = async () => {
      try {
        const data = await getMovieDetails(id, type);
        if (!active) return;
        setMovie(data);
        try {
          const saved = JSON.parse(localStorage.getItem('onyx_continue_watching') || '[]');
          const filtered = saved.filter(i => String(i.id) !== String(data.id)).slice(0, 9);
          localStorage.setItem('onyx_continue_watching', JSON.stringify([{ ...data, type }, ...filtered]));
        } catch (_err) {
          console.error('Failed to save continue watching:', _err);
        }
      } catch (e) {
        void e; // consumed below in fallback
        if (!active) return;
        const fallbackType = type === 'movie' ? 'tv' : 'movie';
        try {
          const data = await getMovieDetails(id, fallbackType);
          if (!active) return;
          setMovie(data);
          navigate(`/player/${id}?type=${fallbackType}`, { replace: true });
          try {
            const saved = JSON.parse(localStorage.getItem('onyx_continue_watching') || '[]');
            const filtered = saved.filter(i => String(i.id) !== String(data.id)).slice(0, 9);
            localStorage.setItem('onyx_continue_watching', JSON.stringify([{ ...data, type: fallbackType }, ...filtered]));
          } catch (watchErr) {
            console.error('Failed to save continue watching:', watchErr);
          }
        } catch (fallbackErr) {
          console.error('Player fallback failed:', fallbackErr);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMovie();
    return () => { active = false; };
  }, [id, type, navigate]);

  // Auto-switch servers if iframe doesn't load within 30 seconds
  useEffect(() => {
    if (loading) return;
    clearTimeout(errorTimeoutRef.current);
    setIframeLoaded(false);

    errorTimeoutRef.current = setTimeout(() => {
      setActiveServer(curr => (curr + 1) % SERVERS.length);
      setIframeKey(k => k + 1);
    }, 30000);

    return () => clearTimeout(errorTimeoutRef.current);
  }, [activeServer, season, episode, loading]);

  // When iframe fires onLoad — cancel timeout, mark loaded
  const handleIframeLoad = useCallback(() => {
    clearTimeout(errorTimeoutRef.current);
    setIframeLoaded(true);
  }, []);

  const switchServer = (idx) => {
    clearTimeout(errorTimeoutRef.current);
    setActiveServer(idx);
    setIframeKey(k => k + 1);
  };

  const switchEpisode = (s, e) => {
    setSeason(s);
    setEpisode(e);
    setIframeKey(k => k + 1);
  };

  const title = movie?.title || movie?.name || '…';
  const year = (movie?.release_date || movie?.first_air_date)?.slice(0, 4);
  const runtime = movie?.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;
  const rating = movie?.vote_average?.toFixed(1);
  const currentUrl = SERVERS[activeServer].url(id, type, season, episode);
  const iframeSrc = (useProxy && PROXY_URL)
    ? `${PROXY_URL.replace(/\/$/, '')}/?url=${encodeURIComponent(currentUrl)}`
    : currentUrl;

  if (!loading && (!includeAdult && isAdultOrMature(movie))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-onyx-bg text-onyx-text p-6">
        <div className="text-center space-y-4 max-w-md animate-entry-float">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--onyx-purple)] animate-pulse">Restricted</span>
          <h1 className="text-3xl font-black tracking-tight">Content Restricted</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-onyx-text-dim leading-relaxed">
            This content is blocked under family-safe settings.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:bg-black/5 dark:hover:bg-white/5 border border-onyx-border cursor-pointer"
          style={{ color: 'var(--onyx-text)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Return to Core Hub
        </button>
      </div>
    );
  }

  const containerClass = isTheaterMode
    ? 'relative w-full h-[60vh] md:h-[75vh] bg-black border-b border-white/10 select-none transition-all duration-500'
    : 'relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl bg-black border border-white/5 select-none transition-all duration-500';

  return (
    <div className="min-h-screen pt-20 transition-all duration-500" style={{ background: 'var(--onyx-bg)', color: 'var(--onyx-text)' }}>

      {/* ── Control Header ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 flex flex-wrap items-center justify-between gap-4 animate-fade-in">

        <button
          onClick={() => navigate(`/movie/${id}?type=${type}`)}
          className="flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:bg-black/5 dark:hover:bg-white/5 border border-onyx-border cursor-pointer"
          style={{ color: 'var(--onyx-text)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to More Info
        </button>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--onyx-purple)] mb-1 animate-pulse">Transmission Active</span>
            <h1 className="text-xl font-black tracking-tight">{title}</h1>
          </div>

          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
              isTheaterMode
                ? 'bg-[var(--onyx-purple-glow)] border-[var(--onyx-purple)] text-[var(--onyx-purple)] shadow-[0_0_15px_var(--onyx-purple-glow)]'
                : 'border-onyx-border hover:border-[var(--onyx-purple)]/50 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--onyx-text-dim)] hover:text-[var(--onyx-text)]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              {isTheaterMode ? (
                <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2"/>
              ) : (
                <>
                  <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2"/>
                  <rect x="4" y="6" width="16" height="12" fill="currentColor" opacity="0.3"/>
                </>
              )}
            </svg>
            {isTheaterMode ? 'Theater Mode Active' : 'Default Mode'}
          </button>
        </div>
      </div>

      {/* ── Player Container ── */}
      <div className={isTheaterMode ? 'w-full max-w-none px-0 mt-[-8px]' : 'max-w-7xl mx-auto px-4 md:px-8'}>
        <div ref={playerContainerRef} className={containerClass}>

          {/* Loading overlay — only while metadata is being fetched */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-zinc-950 z-40">
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--onyx-purple)] animate-shimmer" style={{ width: '60%' }}></div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Decrypting Stream</p>
            </div>
          )}


          {/* Iframe — always mounted after metadata loads */}
          {!loading && (
            <iframe
              key={iframeKey}
              src={iframeSrc}
              className="w-full h-full border-none absolute inset-0 z-10"
              allowFullScreen={true}
              referrerPolicy="origin"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              title={title}
              onLoad={handleIframeLoad}
            />
          )}
        </div>
      </div>

      {/* ── Transmission Console ── */}
      {!loading && movie && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 animate-fade-in">
          <div className="p-6 rounded-[2rem] border backdrop-blur-xl flex flex-col gap-6"
               style={{ background: 'var(--onyx-glass)', borderColor: 'var(--onyx-border)' }}>

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--onyx-border)' }}>
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${iframeLoaded ? 'bg-emerald-400' : 'bg-[var(--onyx-purple)]'} animate-pulse`} />
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--onyx-purple)]">
                  Transmission Console
                  {iframeLoaded && <span className="ml-3 text-emerald-400">· Live</span>}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleProxyToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border cursor-pointer ${
                    useProxy
                      ? 'bg-[var(--onyx-purple-glow)] border-[var(--onyx-purple)] text-[var(--onyx-purple)] shadow-[0_0_10px_var(--onyx-purple-glow)]'
                      : 'border-white/5 text-[var(--onyx-text-dim)] hover:text-[var(--onyx-text)] hover:bg-black/10 dark:hover:bg-white/5'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  {useProxy ? 'Proxy Shield: Active' : 'Proxy Shield: Off'}
                </button>

                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-[var(--onyx-purple)]/30 hover:bg-black/10 dark:hover:bg-white/5 cursor-pointer text-[var(--onyx-text-dim)] hover:text-[var(--onyx-text)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-[var(--onyx-purple)]">
                    {isTheaterMode ? (
                      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2"/>
                    ) : (
                      <>
                        <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2"/>
                        <rect x="4" y="6" width="16" height="12" fill="currentColor" opacity="0.3"/>
                      </>
                    )}
                  </svg>
                  {isTheaterMode ? 'Default View' : 'Theater Mode'}
                </button>
              </div>
            </div>

            {/* Server Selector */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Frequency Shift (Servers)</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {SERVERS.map((s, idx) => {
                  const isActive = activeServer === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => switchServer(idx)}
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        isActive
                          ? ''
                          : 'hover:text-[var(--onyx-text)] hover:bg-black/5 dark:hover:bg-white/5 hover:border-[var(--onyx-purple)]/50'
                      }`}
                      style={{
                        background: isActive ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' : 'var(--onyx-deep)',
                        borderColor: isActive ? 'transparent' : 'var(--onyx-border)',
                        color: isActive ? '#ffffff' : 'var(--onyx-text-dim)',
                        boxShadow: isActive ? '0 0 15px rgba(139, 92, 246, 0.4)' : 'none',
                      }}
                    >
                      {isActive && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      )}
                      {s.label}
                      <span className="opacity-50 font-medium normal-case">({s.name})</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] text-[var(--onyx-text-dim)] opacity-60 mt-1">
                💡 If a server doesn't load within 30s it will auto-switch. You can also click any server manually.
              </p>
            </div>

            {/* TV Episode Selector */}
            {type === 'tv' && movie.seasons && (
              <div className="flex flex-col gap-3 pt-4 border-t" style={{ borderColor: 'var(--onyx-border)' }}>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Episode Control</span>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Season</label>
                    <select
                      value={season}
                      onChange={e => switchEpisode(Number(e.target.value), 1)}
                      className="px-3 py-2 rounded-xl text-[10px] font-black border cursor-pointer"
                      style={{ background: 'var(--onyx-deep)', borderColor: 'var(--onyx-border)', color: 'var(--onyx-text)' }}
                    >
                      {movie.seasons
                        .filter(s => s.season_number > 0)
                        .map(s => (
                          <option key={s.season_number} value={s.season_number}>
                            Season {s.season_number}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Episode</label>
                    <select
                      value={episode}
                      onChange={e => switchEpisode(season, Number(e.target.value))}
                      className="px-3 py-2 rounded-xl text-[10px] font-black border cursor-pointer"
                      style={{ background: 'var(--onyx-deep)', borderColor: 'var(--onyx-border)', color: 'var(--onyx-text)' }}
                    >
                      {Array.from(
                        { length: movie.seasons.find(s => s.season_number === season)?.episode_count || 24 },
                        (_, i) => i + 1
                      ).map(ep => (
                        <option key={ep} value={ep}>Episode {ep}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Metadata & Recommendations ── */}
      {!loading && movie && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pb-32">
          <div className="grid md:grid-cols-4 gap-12 mb-32">
            <div className="md:col-span-3 space-y-8">
              <div className="flex flex-wrap items-center gap-4">
                {year && <span className="text-sm font-bold opacity-50">{year}</span>}
                {runtime && <span className="text-sm font-bold opacity-50">• {runtime}</span>}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: 'var(--onyx-purple-glow)', color: 'var(--onyx-purple)' }}>
                  <span className="text-xs font-black">★ {rating}</span>
                </div>
              </div>
              <p className="text-lg md:text-xl leading-relaxed font-medium opacity-70 max-w-4xl">{movie.overview}</p>
              <div className="flex flex-wrap gap-3">
                {movie.genres?.map(g => (
                  <span key={g.id} className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-onyx-border" style={{ background: 'var(--onyx-glass)' }}>
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60" style={{ color: 'var(--onyx-purple)' }}>Prime Talent</h3>
              <div className="grid grid-cols-2 gap-4">
                {movie.credits?.cast?.slice(0, 4).map(actor => (
                  <div key={actor.id} className="group cursor-pointer">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden mb-2 border grayscale group-hover:grayscale-0 transition-all duration-500 flex items-center justify-center text-xl font-bold border-onyx-border" style={{ background: 'var(--onyx-deep)' }}>
                      {actor.profile_path ? (
                        <img src={`${IMG_BASE}/w185${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <p className="text-[9px] font-black tracking-tighter truncate opacity-70 group-hover:opacity-100 transition-opacity">{actor.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {movie.similar?.results?.length > 0 && (
            <div className="px-0">
              <MovieRow title="Beyond This Frame" movies={movie.similar.results} type={type} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractivePlayer;
