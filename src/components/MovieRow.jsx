import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import Logo from './common/Logo';

// ─── Stream Card ─────────────────────────────────────────────────────────

export const StreamCard = ({ movie, type }) => {
  const navigate = useNavigate();
  const { toggle, isInWatchlist } = useWatchlist();
  const [queueFlash, setQueueFlash] = useState(false);
  const cardRef = useRef(null);

  const inQueue = isInWatchlist(movie.id);
  const title = movie.title || movie.name;
  const rating = movie.vote_average?.toFixed(1);
  const year = (movie.release_date || movie.first_air_date)?.slice(0, 4);
  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/342x513?text=NO+IMAGE';

  const handleQueue = (e) => {
    e.stopPropagation();
    toggle(movie);
    if (!inQueue) {
      setQueueFlash(true);
      setTimeout(() => setQueueFlash(false), 800);
    }
  };

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = x - xc;
    const dy = y - yc;
    // Rotate max 12 degrees
    const rx = -(dy / yc) * 12;
    const ry = (dx / xc) * 12;
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
    el.style.setProperty('--scale', '1.06');
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--scale', '1');
  };

  const goToDetails = () => navigate(`/movie/${movie.id}?type=${type}`);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex-shrink-0 cursor-pointer group w-[150px] sm:w-[200px]"
      style={{
        aspectRatio: '2/3',
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--scale, 1))',
        transition: 'transform 0.15s ease-out'
      }}
      onClick={goToDetails}
    >
      {/* 3D Atmospheric Aura Glow Behind Card */}
      <div 
        className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          transform: 'translateZ(-25px)',
          background: 'radial-gradient(circle, var(--onyx-purple-glow) 0%, transparent 70%)',
          filter: 'blur(30px)',
          mixBlendMode: 'screen'
        }}
      />

      {/* Main Poster Card Container */}
      <div
        className="w-full h-full relative overflow-hidden rounded-[2rem] border border-white/5 bg-onyx-deep group-hover:border-[var(--onyx-purple)]/40 transition-all duration-300"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <img 
          src={poster} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          loading="lazy" 
        />
        
        {/* Holographic Floating Frosted Glass Slate Overlay */}
        <div 
          className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/65 border border-white/10 p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 select-none"
          style={{
            transform: 'translateZ(40px) scale(0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
          }}
        >
          <div className="space-y-2">
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[var(--onyx-purple)]">Dossier Archive</span>
            <h3 className="text-white text-[11px] sm:text-xs font-black tracking-tight leading-tight uppercase drop-shadow-md line-clamp-2">{title}</h3>
            
            <div className="h-[1px] w-full bg-white/10 my-1"></div>
            
            <div className="flex items-center justify-between text-[9px] font-black tracking-widest text-white/50 uppercase">
              <span>{year || 'N/A'}</span>
              {rating && (
                <span className="text-[#4ade80] flex items-center gap-0.5">
                  ★ {rating}
                </span>
              )}
            </div>
            
            <div className="pt-1 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--onyx-purple)] animate-pulse">
              <span>Sync core</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Floating 3D Quick Action Add Button */}
      <button
        onClick={handleQueue}
        className={`absolute top-3 right-3 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/55 backdrop-blur-md border hover:scale-110 z-20 ${queueFlash ? 'animate-bounce' : ''}`}
        style={{
          transform: 'translateZ(30px)',
          borderColor: inQueue ? 'var(--onyx-purple)' : 'rgba(255,255,255,0.15)',
          color: inQueue ? 'var(--onyx-purple)' : 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}
        title={inQueue ? "Remove from Vault" : "Add to Vault"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
           {inQueue ? <path d="M20 6L9 17l-5-5" /> : <path d="M12 5v14m-7-7h14" />}
        </svg>
      </button>
    </div>
  );
};

// ─── Movie Row ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[150px] sm:w-[200px] aspect-[2/3] rounded-[2rem] border border-white/5 relative overflow-hidden bg-white/[0.03]">
    <div className="absolute inset-0 animate-skeleton opacity-30" />
  </div>
);

const MovieRow = ({ title, movies, loading, labelColor, categoryPath, type }) => {
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? el.clientWidth * 0.75 : -el.clientWidth * 0.75, behavior: 'smooth' });
  };

  const handleScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  return (
    <div className="px-8 md:px-16 group/row relative reveal">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"
            style={{ color: labelColor || 'var(--onyx-text)' }}>
            <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: labelColor || 'var(--onyx-purple)' }} />
            {title}
          </h2>
          {categoryPath && (
            <button 
              onClick={() => navigate(categoryPath)}
              className="text-[10px] font-black tracking-widest opacity-20 hover:opacity-100 transition-opacity uppercase cursor-pointer"
            >
              Explore All
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Scroll Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-40 p-4 bg-black/80 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity invisible md:visible border border-white/5"
            style={{ color: 'white' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-40 p-4 bg-black/80 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity invisible md:visible border border-white/5"
            style={{ color: 'white' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-8"
        >
          {loading ? (
            Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            movies.map(movie => (
              <StreamCard key={movie.id} movie={movie} type={type || movie.media_type || 'movie'} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieRow;
