import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies, discover, getMovieDetails, isAdultOrMature } from '../services/tmdb';
import { StreamCard } from '../components/MovieRow';
import FilterBar from '../components/FilterBar';
import { useSettings } from '../hooks/useSettings';
import { useDebounce } from '../hooks/useDebounce';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQ = searchParams.get('q') || '';
  const genre = searchParams.get('genre');
  const lang = searchParams.get('lang');
  const year = searchParams.get('year');
  const { includeAdult } = useSettings();

  const [query, setQuery] = useState(searchQ);
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync with URL query parameter changes
  useEffect(() => {
    setQuery(searchQ);
  }, [searchQ]);

  // Sync local query changes back to URL to keep state unified
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQuery.trim()) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  }, [debouncedQuery, searchParams, setSearchParams]);

  const performIntelligence = useCallback(async (searchTerm, filters) => {
    setLoading(true);
    try {
      let data;
      if (searchTerm) {
        // Text Search with frontend filter synthesis
        const rawResults = await searchMovies(searchTerm);
        let filtered = rawResults || [];
        
        if (!includeAdult) {
          filtered = filtered.filter(item => !item.adult);
        }
        
        if (filters.genre) {
          filtered = filtered.filter(item => 
            item.genre_ids?.includes(parseInt(filters.genre, 10))
          );
        }
        if (filters.lang) {
          filtered = filtered.filter(item => 
            item.original_language === filters.lang
          );
        }
        if (filters.year) {
          filtered = filtered.filter(item => {
            const date = item.release_date || item.first_air_date;
            return date?.startsWith(filters.year);
          });
        }

        // Fetch certifications in parallel for top 15 results to filter out mature titles
        if (!includeAdult && filtered.length > 0) {
          const topResults = filtered.slice(0, 15);
          const detailedPromises = topResults.map(async (item) => {
            try {
              const details = await getMovieDetails(item.id, item.media_type || 'movie');
              return { ...item, ...details };
            } catch {
              return item;
            }
          });
          const detailedItems = await Promise.all(detailedPromises);
          filtered = detailedItems.filter(item => !isAdultOrMature(item));
        }

        data = filtered;
      } else {
        // Discovery Filter Mode
        const tmdbFilters = {};
        if (filters.genre) tmdbFilters.with_genres = filters.genre;
        if (filters.lang) tmdbFilters.with_original_language = filters.lang;
        if (filters.year) tmdbFilters.primary_release_year = filters.year;

        let rawDiscover = await discover('movie', tmdbFilters);
        if (!includeAdult) {
          rawDiscover = rawDiscover.filter(item => !item.adult);
        }

        // Fetch certifications in parallel for top 15 discover results to filter out mature titles
        if (!includeAdult && rawDiscover.length > 0) {
          const topResults = rawDiscover.slice(0, 15);
          const detailedPromises = topResults.map(async (item) => {
            try {
              const details = await getMovieDetails(item.id, 'movie');
              return { ...item, ...details };
            } catch {
              return item;
            }
          });
          const detailedItems = await Promise.all(detailedPromises);
          rawDiscover = detailedItems.filter(item => !isAdultOrMature(item));
        }

        data = rawDiscover;
      }
      setResults(data || []);
    } catch (err) {
      console.error("Discovery error:", err);
    } finally {
      setLoading(false);
    }
  }, [includeAdult]);

  useEffect(() => {
    if (debouncedQuery.trim() || genre || lang || year) {
      performIntelligence(debouncedQuery, { genre, lang, year });
    } else {
      setResults([]);
    }
  }, [debouncedQuery, genre, lang, year, performIntelligence]);

  const handleSearch = async (e) => {
    e.preventDefault();
    performIntelligence(query, { genre, lang, year });
  };

  return (
    <div className="relative min-h-screen px-6 md:px-12 pt-32 pb-24 animate-fade-in" style={{ background: 'var(--onyx-bg)' }}>
      {/* Search Header */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
            <span className="text-[10px] font-black text-onyx-purple uppercase tracking-[0.4em] mb-4 inline-block">
                {debouncedQuery || genre || lang || year ? 'Universal Intelligence' : 'Deep Discovery Node'}
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-10 tracking-tightest drop-shadow-2xl text-onyx-text">
                {debouncedQuery || genre || lang || year ? 'Search Results' : 'Content Flux'}
            </h1>
            <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto mb-8">
                <input 
                    type="text" 
                    placeholder="Search characters, titles, or legacies..." 
                    className="w-full bg-onyx-glass border border-onyx-glass-border text-onyx-text placeholder:text-onyx-text-dim rounded-[2rem] px-10 py-6 text-xl md:text-2xl font-bold focus:outline-none focus:border-onyx-purple/50 focus:bg-white/5 transition-all duration-700 shadow-2xl"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                    type="submit" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 py-4 px-10 rounded-full text-[10px] uppercase font-black tracking-[0.3em] bg-onyx-purple text-white hover:bg-onyx-purple/80 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-onyx-purple/20 cursor-pointer"
                >
                    Link
                </button>
            </form>
            
            {/* Filter Bar integrated into the Search node */}
            <div className="max-w-4xl mx-auto border-t border-white/5 pt-4">
              <FilterBar />
            </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--onyx-purple)] border-t-transparent animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Resonating Search Grid...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-20 gap-x-12 max-w-7xl mx-auto px-4 animate-fade-in">
          {results.filter(m => m.poster_path).map((movie) => (
            <div key={movie.id} className="flex justify-center transition-transform hover:z-50">
                <StreamCard movie={movie} type={movie.media_type || (movie.title ? 'movie' : 'tv')} />
            </div>
          ))}
        </div>
      ) : query && !loading && (
        <div className="text-center py-24 opacity-30 animate-pulse">
            <p className="text-4xl font-black tracking-widest uppercase">Void Detected</p>
            <p className="text-xs mt-4 tracking-[0.2em]">The Onyx core found no resonance for "{query}".</p>
        </div>
      )}
    </div>
  );
};

export default Search;
