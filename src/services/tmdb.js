import axios from 'axios';
import axiosRetry from 'axios-retry';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'https://onyx-proxy.onyx-movies.workers.dev';

const getProxyUrl = (targetUrl) => {
  const cleanProxy = PROXY_URL.replace(/\/$/, '');
  return `${cleanProxy}/?url=${encodeURIComponent(targetUrl)}`;
};

const tmdb = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ''), // Purge trailing slash
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
  timeout: 1500,
});

// Configure Resilience Node
axiosRetry(tmdb, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Only retry using axios-retry if it's already using the proxy fallback
    // (We don't want to waste time retrying a blocked direct URL)
    if (error.config && !error.config._isProxyRetry) {
      return false;
    }
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
  }
});

try {
  localStorage.removeItem('onyx_use_proxy');
} catch {
  // Ignore storage block
}

// Check and apply cached proxy status to bypass connection timeout instantly
tmdb.interceptors.request.use(
  (config) => {
    let useProxy = false;
    try {
      useProxy = sessionStorage.getItem('onyx_use_proxy') === 'true';
    } catch {
      // Ignore storage block
    }
    
    if (useProxy) {
      config._isProxyRetry = true;
      const fullUrl = tmdb.getUri(config);
      config.baseURL = '';
      config.url = getProxyUrl(fullUrl);
      config.params = {}; // Clear params since they are already serialized in the fullUrl
      config.timeout = 15000; // Allow more time for proxied requests
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Automated VPN/CORS Proxy Fallback on network blocks
tmdb.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isNetworkError = error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.response;
    
    if (config && !config._isProxyRetry && isNetworkError) {
      // Cache proxy status to speed up subsequent requests
      try {
        sessionStorage.setItem('onyx_use_proxy', 'true');
      } catch {
        // Ignore storage block
      }
      
      config._isProxyRetry = true;
      const fullUrl = tmdb.getUri(config);
      
      // Use vanilla axios to request via proxy, bypassing tmdb default params/base URL
      const response = await axios({
        method: config.method || 'get',
        url: getProxyUrl(fullUrl),
        timeout: 15000,
        headers: {
          'Accept': 'application/json'
        }
      });
      return response;
    }
    return Promise.reject(error);
  }
);

// Standardize: Remove leading slashes to prevent root-relative redirections
const clean = (path) => path.replace(/^\//, '');

// Helper to get fresh settings
const getAdultParam = () => ({ include_adult: localStorage.getItem('onyx_include_adult') === 'true' });

export const getTrending = async (type = 'movie', timeWindow = 'day', page = 1) => {
  const { data } = await tmdb.get(clean(`/trending/${type}/${timeWindow}`), {
    params: { page, ...getAdultParam() }
  });
  return data.results;
};

export const getPopular = async (type = 'movie', page = 1) => {
  const { data } = await tmdb.get(clean(`/${type}/popular`), {
    params: { page, ...getAdultParam() }
  });
  return data.results;
};

export const getTopRated = async (type = 'movie') => {
  const { data } = await tmdb.get(clean(`/${type}/top_rated`), {
    params: { ...getAdultParam() }
  });
  return data.results;
};

export const getUpcoming = async () => {
  const { data } = await tmdb.get(clean('/movie/upcoming'), {
    params: { ...getAdultParam() }
  });
  return data.results;
};

export const getNetflixOriginals = async () => {
  const { data } = await tmdb.get(clean('/discover/tv'), {
    params: { with_networks: 213, ...getAdultParam() }
  });
  return data.results;
};

// Aliased and Fixed for UI Argument Swap
export const getDetails = async (type, id) => {
  const { data } = await tmdb.get(clean(`/${type}/${id}`), {
    params: { append_to_response: 'videos,credits,similar,release_dates,content_ratings', ...getAdultParam() }
  });
  return data;
};

export const getMovieDetails = async (id, type = 'movie') => {
  return getDetails(type, id);
};

export const getTrailers = async (type, id) => {
  const { data } = await tmdb.get(clean(`/${type}/${id}/videos`));
  return data.results.filter(v => v.site === 'YouTube' && v.type === 'Trailer');
};

export const searchMovies = async (query, filters = {}) => {
  const { data } = await tmdb.get(clean('/search/multi'), {
    params: { query, ...filters, ...getAdultParam() }
  });
  return data.results;
};

export const getMoviesByCategory = async (category) => {
  const { data } = await tmdb.get(clean(`/movie/${category}`), {
    params: { ...getAdultParam() }
  });
  return data.results;
};

export const getTVByCategory = async (category) => {
  const { data } = await tmdb.get(clean(`/tv/${category}`), {
    params: { ...getAdultParam() }
  });
  return data.results;
};

// --- New Discover Feature for Filters ---
export const discover = async (type = 'movie', filters = {}) => {
  const { data } = await tmdb.get(clean(`/discover/${type}`), {
    params: { ...filters, ...getAdultParam() }
  });
  return data.results;
};

export const isAdultOrMature = (movie) => {
  if (!movie) return false;
  if (movie.adult) return true;

  // Check certifications in movie release dates
  if (movie.release_dates?.results) {
    for (const country of movie.release_dates.results) {
      if (country.release_dates) {
        for (const release of country.release_dates) {
          const cert = release.certification?.toUpperCase();
          if (['R', 'NC-17', '18', '18+', 'MA-17', 'R18', 'R-18', 'R21', 'M18'].includes(cert)) {
            return true;
          }
        }
      }
    }
  }

  // Check certifications in tv content ratings
  if (movie.content_ratings?.results) {
    for (const ratingObj of movie.content_ratings.results) {
      const rating = ratingObj.rating?.toUpperCase();
      if (['TV-MA', '18', '18+', 'MA-17', 'R18', 'R-18', 'R21', 'M18'].includes(rating)) {
        return true;
      }
    }
  }

  return false;
};

export default tmdb;
