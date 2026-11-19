import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './common/Logo';

const IMG_BASE = 'https://image.tmdb.org/t/p';

const HeroBanner = ({ movie, loading }) => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    // Safety Timeout: If image takes too long, just show the content anyway
    const safetyTimer = setTimeout(() => {
      if (movie) setImgLoaded(true);
    }, 2500);

    return () => clearTimeout(safetyTimer);
  }, [movie]);

  useEffect(() => {
    // Hide skeleton once movie data is present and image is loaded (or timed out)
    if (movie && imgLoaded) {
      const timer = setTimeout(() => setShowSkeleton(false), 300);
      return () => clearTimeout(timer);
    }
  }, [movie, imgLoaded]);

  // Loading Skeleton State
  if (loading || !movie || showSkeleton) {
    return (
      <div className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ height: '90vh', minHeight: '560px', maxHeight: '860px', background: 'var(--onyx-bg)' }}>
        {/* Shimmer Background */}
        <div className="absolute inset-0 animate-skeleton opacity-20"></div>

        {/* Center Logo Pulsar */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="animate-logo-pulse">
            <Logo size={120} />
          </div>
          <div className="h-1 w-48 rounded-full bg-onyx-purple/20 overflow-hidden">
            <div className="h-full bg-onyx-purple animate-shimmer" style={{ width: '40%' }}></div>
          </div>
        </div>

        {/* Content Skeletons */}
        <div className="absolute bottom-24 left-8 md:left-16 lg:left-20 w-full max-w-2xl px-4">
          <div className="flex gap-4 mb-6">
            <div className="w-20 h-6 rounded bg-white/5 animate-pulse"></div>
            <div className="w-16 h-6 rounded bg-white/5 animate-pulse"></div>
          </div>
          <div className="w-3/4 h-16 rounded bg-white/5 animate-pulse mb-6"></div>
          <div className="w-1/2 h-4 rounded bg-white/5 animate-pulse mb-2"></div>
          <div className="w-2/3 h-4 rounded bg-white/5 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const type = movie.first_air_date ? 'tv' : 'movie';
  const title = movie.title || movie.name;
  const overview = movie.overview?.slice(0, 180) + (movie.overview?.length > 180 ? '...' : '');
  const backdrop = `${IMG_BASE}/original${movie.backdrop_path}`;
  const rating = movie.vote_average?.toFixed(1);
  const year = (movie.release_date || movie.first_air_date)?.slice(0, 4);

  return (
    <div className="relative w-full animate-in fade-in duration-1000" style={{ height: '90vh', minHeight: '560px', maxHeight: '860px' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        {movie.backdrop_path && (
          <img
            src={backdrop}
            alt={title}
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: imgLoaded ? 1 : 0 }}
          />
        )}
        {/* Dark Gradient Overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--onyx-bg) 0%, rgba(var(--onyx-bg-rgb), 0.3) 40%, transparent 60%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(var(--onyx-bg-rgb), 0.5) 0%, transparent 15%)' }}></div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-24 px-8 md:px-16 lg:px-20">
        <div className="max-w-2xl">
          {/* Badges */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white shadow-xl" style={{ background: 'var(--onyx-purple)' }}>
              {type === 'tv' ? 'Series' : 'Feature'}
            </span>
            {rating && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-onyx-purple/10 border border-onyx-purple/20">
                <span style={{ color: '#fbbf24' }}>★</span>
                <span className="text-xs font-black text-white">{rating}</span>
              </div>
            )}
            {year && <span className="text-xs font-bold opacity-50">{year}</span>}
          </div>

          {/* Title */}
          <h1
            className="font-black leading-none mb-6 tracking-tighter italic"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', textShadow: '0 10px 40px rgba(0,0,0,0.5)', color: 'var(--onyx-text)' }}
          >
            {title}
          </h1>

          {/* Overview */}
          <p className="text-sm md:text-lg font-medium leading-relaxed mb-10 opacity-70 max-w-xl" style={{ color: 'var(--onyx-text)' }}>
            {overview}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(`/player/${movie.id}?type=${type}`)}
              className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 20px 40px rgba(139,92,246,0.3)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch
            </button>
            <button
              onClick={() => navigate(`/movie/${movie.id}?type=${type}`)}
              className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.1em] transition-all duration-300 hover:scale-105 active:scale-95 border"
              style={{ background: 'var(--onyx-glass)', backdropFilter: 'blur(30px)', borderColor: 'var(--onyx-border)', color: 'var(--onyx-text)' }}
            >
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
