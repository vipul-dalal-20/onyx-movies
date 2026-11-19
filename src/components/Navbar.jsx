import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Logo from './common/Logo';

const Navbar = () => {
  const { currentUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'FILMS', path: '/movies' },
    { name: 'TV', path: '/tv' },
    { name: 'Watchlist', path: '/watchlist' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-5 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Branding - Absolute Grade Logo */}
        <Link to="/" className="flex items-center gap-3 group bg-onyx-logo-bg backdrop-blur-xl border border-onyx-logo-border rounded-full py-1 px-3.5 justify-content-center">
          <div className="relative">
            <Logo size={42} className="group-hover:scale-110 transition-transform duration-500" />
          </div>
          <span className="onyx-brand text-2xl tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500 text-onyx-text drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
            ONYX
          </span>
        </Link>

        {/* Navigation - Glass Capsule */}
        <div className="hidden md:flex items-center bg-onyx-glass backdrop-blur-2xl border border-onyx-glass-border px-8 py-3 rounded-full shadow-2xl gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 hover:text-onyx-purple ${location.pathname === link.path ? 'text-onyx-purple' : 'text-onyx-text opacity-60 hover:opacity-100'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Search Portal */}
          <Link
            to="/search"
            className="w-11 h-11 bg-onyx-glass backdrop-blur-xl border border-onyx-glass-border rounded-full flex items-center justify-center hover:bg-onyx-purple hover:border-onyx-purple transition-all duration-500 group shadow-lg"
            title="Neural Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${isDarkMode ? 'text-white' : 'text-black'} group-hover:text-white transition-colors`}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-11 h-11 bg-onyx-glass backdrop-blur-xl border border-onyx-glass-border rounded-full flex items-center justify-center hover:bg-onyx-purple hover:border-onyx-purple transition-all duration-500 group shadow-lg"
            title={isDarkMode ? "Switch to Pearl Mode" : "Switch to Obsidian Mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:text-white transition-colors"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black group-hover:text-white transition-colors"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            )}
          </button>

          {/* Profile Portal */}
          <Link
            to="/profile"
            className="flex items-center bg-onyx-glass backdrop-blur-xl border border-onyx-glass-border p-0.5 rounded-full hover:border-onyx-purple transition-all duration-500 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/5 bg-onyx-deep-blue">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'onyx'}`}
                alt="Profile"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
