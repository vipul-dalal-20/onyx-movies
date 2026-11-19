import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MovieDepthCard = ({ movie }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const title = movie.title || movie.name;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const year = (movie.release_date || movie.first_air_date)?.slice(0, 4);

  const handleNavigate = () => {
    const type = movie.first_air_date ? 'tv' : 'movie';
    navigate(`/movie/${movie.id}?type=${type}`);
  };

  return (
    <div
      className="group relative flex-shrink-0 w-[150px] sm:w-[190px] md:w-[240px] aspect-[2/3] cursor-pointer z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNavigate}
    >
      {/* Base Minimalist Card */}
      <div
        className={`h-full w-full bg-onyx-obsidian rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-700 pointer-events-auto ${isHovered ? 'shadow-[0_20px_60px_rgba(139,92,246,0.3)] opacity-100 scale-105 -translate-y-2' : 'grayscale-[20%] opacity-90 scale-100'}`}
      >
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        
        {/* Info Slide-in */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-xs md:text-sm font-black tracking-wider truncate drop-shadow-md">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/60 text-[10px] tracking-widest">{year}</span>
            {rating !== 'N/A' && <span className="text-[#4ade80] text-[10px] font-bold">★ {rating}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDepthCard;
