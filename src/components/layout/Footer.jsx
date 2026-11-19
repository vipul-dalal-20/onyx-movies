import { Link } from 'react-router-dom';
import tmdbLogo from '../../assets/tmdb_logo.jpg';

const Footer = () => {
  return (
    <footer className="w-full border-t border-onyx-border bg-onyx-deep/60 backdrop-blur-xl mt-20 pb-28 md:pb-12 pt-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand section */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-3">
            <span className="font-['Outfit'] font-black text-2xl tracking-[0.2em] text-white">
              ONYX
            </span>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10">
              Cinema
            </span>
          </div>
          <p className="text-xs text-onyx-text-dim text-center md:text-left max-w-sm">
            The Anthology of Cinema. Discover, explore, and track movies & TV shows with real-time updates.
          </p>
        </div>

        {/* TMDB Attribution Section */}
        <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
            title="The Movie Database"
          >
            <span className="text-2xl font-semibold text-onyx-text-dim group-hover:text-white transition-colors">
              Powered by
            </span>
            <img
              src={tmdbLogo}
              alt="The Movie Database (TMDB)"
              className="h-25 w-auto inline-block rounded-2xl"
            />
          </a>
          <p className="text-[11px] text-onyx-text-dim/70 max-w-xs leading-relaxed">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 pt-6 border-t border-onyx-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-onyx-text-dim/60">
        <p>© {new Date().getFullYear()} ONYX. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/movies" className="hover:text-white transition-colors">Films</Link>
          <Link to="/tv" className="hover:text-white transition-colors">TV Shows</Link>
          <Link to="/watchlist" className="hover:text-white transition-colors">Watchlist</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
