import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getTrailers, isAdultOrMature } from '../services/tmdb';
import { useWatchlist } from '../hooks/useWatchlist';
import { useSettings } from '../hooks/useSettings';
import { DetailSkeleton } from '../components/common/Skeleton';
import MovieRow from '../components/MovieRow';

const CastMember = ({ actor }) => {
  const [imgError, setImgError] = useState(false);

  const getPlaceholderEmoji = (gender) => {
    if (gender === 1) return '👩';
    if (gender === 2) return '👨';
    return '👤';
  };

  return (
    <div className="flex-shrink-0 text-center space-y-3 group cursor-pointer w-20">
      <div className="w-20 h-20 rounded-full overflow-hidden border border-white/5 transition-all duration-500 shadow-xl grayscale group-hover:grayscale-0 group-hover:scale-110 flex items-center justify-center bg-onyx-deep text-3xl">
        {actor.profile_path && !imgError ? (
          <img
            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
            alt={actor.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="select-none">{getPlaceholderEmoji(actor.gender)}</span>
        )}
      </div>
      <p className="text-[10px] font-black text-onyx-text-dim group-hover:text-onyx-text transition-colors truncate">
        {actor.name}
      </p>
    </div>
  );
};

const MovieDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'movie';

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { items, toggle } = useWatchlist();
  const { includeAdult } = useSettings();
  const [trailerKey, setTrailerKey] = useState(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(50);
  const iframeRef = useRef(null);

  const isInWatchlist = items.some(item => item.id.toString() === id.toString());

  // Scroll to Top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    const fetchDetails = async () => {
      try {
        const data = await getMovieDetails(id, type);
        setMovie(data);
      } catch (err) {
        console.error("Failed to fetch details for type", type, err);
        // Fallback: attempt to query using the opposite media type
        const fallbackType = type === 'movie' ? 'tv' : 'movie';
        try {
          const data = await getMovieDetails(id, fallbackType);
          setMovie(data);
          // Redirect the browser parameters to the correct type
          navigate(`/movie/${id}?type=${fallbackType}`, { replace: true });
        } catch (fallbackErr) {
          console.error("Fallback fetch also failed:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, type, navigate]);

  useEffect(() => {
    setTrailerKey(null);
    setIsPlayingTrailer(false);
    setIsMuted(true);
    setVolume(50);
    const fetchTrailers = async () => {
      try {
        const trailers = await getTrailers(type, id);
        if (trailers && trailers.length > 0) {
          setTrailerKey(trailers[0].key);
        }
      } catch (err) {
        console.error("Failed to fetch trailers:", err);
      }
    };
    fetchTrailers();
  }, [id, type]);

  const toggleMute = (e) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (iframeRef.current) {
      if (newMuted) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: [] }),
          '*'
        );
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [volume] }),
          '*'
        );
      }
    }
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (iframeRef.current) {
      if (val === 0) {
        setIsMuted(true);
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: [] }),
          '*'
        );
      } else {
        setIsMuted(false);
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [val] }),
          '*'
        );
      }
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!movie || (!includeAdult && isAdultOrMature(movie))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-onyx-bg text-onyx-text p-6">
        <div className="text-center space-y-4 max-w-md animate-entry-float">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--onyx-purple)] animate-pulse">
            {!movie ? 'Error' : 'Restricted'}
          </span>
          <h1 className="text-3xl font-black tracking-tight">
            {!movie ? 'Content Not Found' : 'Content Restricted'}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-onyx-text-dim leading-relaxed">
            {!movie 
              ? 'The requested content could not be retrieved.'
              : 'This content is blocked under family-safe settings.'
            }
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

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
    : '';

  return (
    <div className="relative min-h-screen pb-32 transition-colors duration-500 bg-onyx-bg">
      
      {/* ── Immersive Cinematic Backdrop Hero ── */}
      <div 
        className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden bg-black"
        onMouseEnter={() => setIsPlayingTrailer(true)}
        onMouseMove={() => { if (!isPlayingTrailer) setIsPlayingTrailer(true); }}
        onMouseLeave={() => setIsPlayingTrailer(false)}
      >
        {/* Backdrop image */}
        <img
          src={backdropUrl}
          alt="Backdrop"
          className={`w-full h-full object-cover scale-105 transition-opacity duration-700 ${
            isPlayingTrailer && trailerKey ? 'opacity-0' : 'opacity-60'
          }`}
          style={{ objectPosition: 'center 20%' }}
        />

        {/* Autoplay Trailer Overlay */}
        {isPlayingTrailer && trailerKey && (
          <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`}
              title="Trailer"
              className="absolute top-1/2 left-1/2 w-[177.77vh] h-[56.25vw] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-100 transition-opacity duration-500"
              style={{ border: 'none' }}
              allow="autoplay; encrypted-media"
            />
          </div>
        )}
        
        {/* Ambient radial blur and gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-onyx-bg via-onyx-bg/30 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx-bg via-transparent to-transparent z-10 hidden md:block" />

        {/* Cinematic Meta Information Overlay */}
        <div className="absolute bottom-0 left-0 w-full z-20 px-6 md:px-16 pb-12 md:pb-20 max-w-5xl">
          <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in">
            <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase text-onyx-purple tracking-widest border border-onyx-purple/20 bg-onyx-purple/10">
              {movie.status}
            </span>
            <span className="text-white/60 text-xs font-black tracking-widest">{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
            <span className="text-white/30 text-xs font-black">•</span>
            <span className="text-white/60 text-xs font-black tracking-widest">{movie.runtime ? `${movie.runtime}m` : `${movie.number_of_seasons} Seasons`}</span>
            {movie.vote_average && (
              <>
                <span className="text-white/30 text-xs font-black">•</span>
                <span className="text-[#4ade80] text-xs font-black tracking-widest">★ {movie.vote_average.toFixed(1)}</span>
              </>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-none tracking-tightest italic drop-shadow-2xl">
            {movie.title || movie.name}
          </h1>

          <div className="flex flex-wrap gap-2.5 mb-8">
            {movie.genres?.map(genre => (
              <span key={genre.id} className="text-[9px] font-black uppercase tracking-widest text-white/50 border border-white/10 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-md">
                {genre.name}
              </span>
            ))}
          </div>

          <p className="text-white/80 text-base md:text-lg leading-relaxed font-medium max-w-3xl mb-10 drop-shadow-md">
            {movie.overview}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
               onClick={() => navigate(`/player/${movie.id}?type=${type}`)}
               className="flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all duration-300 hover:scale-[1.05] active:scale-95 cursor-pointer shadow-lg hover:shadow-onyx-purple/30"
               style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 20px 40px rgba(139,92,246,0.25)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch
            </button>
            <button
              onClick={() => toggle(movie)}
              className="px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:bg-white/10 border border-white/15 cursor-pointer backdrop-blur-sm"
              style={{ background: isInWatchlist ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.02)', color: isInWatchlist ? 'var(--onyx-purple)' : 'white' }}
            >
              {isInWatchlist ? 'Saved to watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        </div>

        {/* Floating Mute/Unmute & Volume Control */}
        {isPlayingTrailer && trailerKey && (
          <div
            className="absolute bottom-12 md:bottom-20 right-6 md:right-16 z-30 flex items-center gap-3 px-4 py-3.5 rounded-full border border-white/20 bg-black/60 hover:bg-black/85 transition-all duration-300 backdrop-blur-md shadow-2xl group/volume"
          >
            <button
              onClick={toggleMute}
              className="flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200"
              title={isMuted ? "Unmute Trailer" : "Mute Trailer"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <line x1="22" y1="9" x2="16" y2="15"/>
                  <line x1="16" y1="9" x2="22" y2="15"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              onClick={(e) => e.stopPropagation()}
              className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 h-1 rounded-lg appearance-none cursor-pointer bg-white/25 accent-[#8b5cf6] outline-none"
              title="Adjust volume"
            />
          </div>
        )}
      </div>

      {/* ── Secondary Panel Layout ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 mt-8 space-y-12">
        
        {/* Cast Overview */}
        {movie.credits?.cast?.length > 0 && (
          <div className="space-y-4 reveal">
            <h3 className="text-[10px] font-black text-onyx-text/40 uppercase tracking-[0.4em]">Prime Cast Archive</h3>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 scroll-smooth">
              {movie.credits.cast.slice(0, 12).map(actor => (
                <CastMember key={actor.id} actor={actor} />
              ))}
            </div>
          </div>
        )}

        {/* Extra Cinematic Dossier Attributes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-onyx-border bg-onyx-glass backdrop-blur-xl reveal">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-onyx-text-dim">Origin Country</p>
            <p className="text-sm font-bold mt-1 uppercase" style={{ color: 'var(--onyx-text)' }}>{movie.production_countries?.[0]?.iso_3166_1 || 'US'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-onyx-text-dim">Language Sync</p>
            <p className="text-sm font-bold mt-1 uppercase" style={{ color: 'var(--onyx-text)' }}>{movie.spoken_languages?.[0]?.english_name || movie.original_language || 'English'}</p>
          </div>
          {movie.budget > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-onyx-text-dim">Production Vault</p>
              <p className="text-sm font-bold mt-1 font-mono" style={{ color: 'var(--onyx-text)' }}>${(movie.budget / 1000000).toFixed(1)}M</p>
            </div>
          )}
          {movie.revenue > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-onyx-text-dim">Dossier Return</p>
              <p className="text-sm font-bold mt-1 font-mono" style={{ color: 'var(--onyx-text)' }}>${(movie.revenue / 1000000).toFixed(1)}M</p>
            </div>
          )}
        </div>

      </div>

      {/* Similar Discovery (Fixed Section) */}
      {movie.similar?.results?.length > 0 && (
        <section className="mt-12 px-0 group/row relative overflow-visible">
          <MovieRow
            title="Symmetry & Similarities"
            movies={movie.similar.results}
            type={type}
          />
        </section>
      )}
    </div>
  );
};

export default MovieDetails;
