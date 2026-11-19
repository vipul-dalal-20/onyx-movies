import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as tmdbService from '../services/tmdb';
import { StreamCard } from '../components/MovieRow';
import { GridSkeleton } from '../components/common/Skeleton';

const CATEGORY_MAP = {
  'trending': { label: 'Trending Now', fetcher: () => tmdbService.getTrending('movie') },
  'trending-tv': { label: 'Trending TV', fetcher: () => tmdbService.getTrending('tv') },
  'popular': { label: 'Popular Movies', fetcher: () => tmdbService.getPopular('movie') },
  'popular-tv': { label: 'Popular TV Shows', fetcher: () => tmdbService.getPopular('tv') },
  'top_rated': { label: 'Top Rated', fetcher: () => tmdbService.getTopRated('movie') },
  'netflix-originals': { label: 'Netflix Originals', fetcher: () => tmdbService.getNetflixOriginals() },
  'upcoming': { label: 'Coming Soon', fetcher: () => tmdbService.getUpcoming() },
};

const DiscoveryGrid = () => {
  const { category = 'trending' } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const meta = CATEGORY_MAP[category] || CATEGORY_MAP['trending'];

  useEffect(() => {
    let cancelled = false;
    const { fetcher } = CATEGORY_MAP[category] || CATEGORY_MAP['trending'];
    
    setIsLoading(true);
    
    // Fetch 5 pages (~100 titles) for cinematic library depth
    const fetchPages = async () => {
      try {
        const pages = [1, 2, 3, 4, 5];
        const results = await Promise.all(pages.map(p => fetcher(p)));
        if (!cancelled) {
          const flatResults = results.flat().filter(Boolean);
          // Deduplicate
          const uniqueItems = Array.from(new Map(flatResults.map(i => [i.id, i])).values());
          setItems(uniqueItems);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Failed to expand discovery. Check your connection.');
      } finally { if (!cancelled) setIsLoading(false); }
    };

    fetchPages();
    return () => { cancelled = true; };
  }, [category]);

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--onyx-bg)' }}>
      {/* Header */}
      <div className="relative pt-28 pb-12 px-16 md:px-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.12), transparent 70%)', filter: 'blur(40px)' }} />

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest transition-colors"
          style={{ color: 'rgba(139,92,246,0.8)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <p className="text-[10px] font-black uppercase tracking-[0.6em] mb-3" style={{ color: 'rgba(139,92,246,0.7)' }}>
          Onyx · Browse
        </p>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-4" style={{ color: 'var(--onyx-text)' }}>{meta.label}</h1>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--onyx-text-dim)' }}>
          {isLoading ? 'Loading...' : `${items.filter(i => i.poster_path).length} titles`}
        </p>
      </div>

      {/* Grid */}
      <div className="px-16 md:px-20">
        {error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="text-4xl">⚠️</div>
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--onyx-text-dim)' }}>{error}</p>
            <button
              onClick={() => setIsLoading(true)}
              className="mt-4 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white border hover:border-purple-500/50 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >Retry</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-5"
            style={{ paddingBottom: '140px' }}>
            {isLoading
              ? Array(18).fill(0).map((_, i) => <GridSkeleton key={i} />)
              : items.filter(i => i.poster_path).map((item, idx) => (
                <div key={item.id} style={{ animation: `fadeIn 0.4s ease ${idx * 20}ms forwards`, opacity: 0 }}>
                  <StreamCard movie={item} />
                </div>
              ))
            }
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

export default DiscoveryGrid;
