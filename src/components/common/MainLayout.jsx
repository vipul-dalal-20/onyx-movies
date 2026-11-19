import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { searchMovies } from '../../services/tmdb';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarSeed] = useState(localStorage.getItem('onyx_avatar_seed') || user?.email);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(async () => {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        console.error('Logout failed', err);
        setIsLoggingOut(false);
      }
    }, 1500);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const results = await searchMovies(searchQuery);
          setSearchResults(results.slice(0, 5));
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className={`min-h-screen bg-onyx-bg text-onyx-text selection:bg-onyx-purple selection:text-white transition-colors duration-500 font-sans`}>
      {/* THE JEWEL ISLAND NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 md:px-12 md:py-10 pointer-events-none">
        <div className="max-w-9xl mx-auto flex items-center justify-between pointer-events-auto">

          {/* THE BRAND MARK */}
          <Link to="/" className="flex items-center gap-6 group">
            <div className={`relative w-14 h-14 bg-onyx-glass backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-onyx-glass-border shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-[360deg] group-hover:border-onyx-purple/40`}>
              <div className="absolute inset-0 bg-gradient-to-br from-onyx-purple/10 to-transparent rounded-2xl"></div>
              <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className={`${isDarkMode ? 'text-white' : 'text-onyx-deep'} opacity-90`} />
                <path d="M35,65 C40,50 50,55 60,65 C70,75 75,60 80,45" fill="none" stroke="#8b5cf6" strokeWidth="10" strokeLinecap="round" className="animate-signature-pulse" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tightest uppercase italic leading-none text-onyx-text">ONYX</span>
              <span className="text-[8px] font-black tracking-[0.8em] text-onyx-purple uppercase ml-1 mt-1 opacity-60">Anthology</span>
            </div>
          </Link>

          {/* Frosted Discovery Home */}
          <div className="hidden lg:flex items-center gap-10 bg-onyx-glass backdrop-blur-3xl px-10 py-4 rounded-full border border-onyx-glass-border shadow-2xl ml-8 transition-colors">
            {[
              { path: '/', label: 'Discovery' },
              { path: '/movies', label: 'Masterpieces' },
              { path: '/tv', label: 'Episodes' },
              { path: '/watchlist', label: 'Watchlist' }
            ].map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-[9px] font-black uppercase tracking-[0.4em] transition-all duration-500 hover:text-onyx-text ${isActive ? 'text-onyx-text' : 'text-onyx-text-dim'}`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-onyx-purple rounded-full shadow-[0_0_8px_#8b5cf6] animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-6 flex-1 justify-end">
            {/* Search Jewel */}
            <div className={`relative transition-all duration-700 flex items-center ${isSearchActive ? 'w-full max-w-xs' : 'w-14'}`}>
              <div
                className={`flex items-center w-full bg-onyx-glass backdrop-blur-3xl rounded-full border border-onyx-glass-border px-5 transition-all duration-700 shadow-xl overflow-hidden ${isSearchActive ? 'h-14 border-onyx-purple/30' : 'h-14 justify-center cursor-pointer hover:bg-onyx-purple/10'}`}
                onClick={() => !isSearchActive && setIsSearchActive(true)}
              >
                <div className="flex items-center justify-center min-w-[20px]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-onyx-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="LOCATE..."
                  className={`bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-onyx-text ml-4 w-full placeholder:text-onyx-text-dim transition-opacity duration-500 ${isSearchActive ? 'opacity-100' : 'opacity-0 invisible'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setIsSearchActive(false)}
                />
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && isSearchActive && (
                <div className="absolute top-20 right-0 w-[350px] bg-onyx-bg/95 backdrop-blur-3xl rounded-[2rem] p-6 border border-onyx-glass-border shadow-2xl animate-slide-up z-50">
                  <div className="flex flex-col gap-6">
                    {searchResults.map(movie => (
                      <Link
                        to={`/movie/${movie.id}?type=${movie.first_air_date ? 'tv' : 'movie'}`}
                        key={movie.id}
                        className="flex items-center gap-6 hover:bg-onyx-purple/10 p-3 rounded-2xl transition-all group/res"
                        onClick={() => { setSearchResults([]); setSearchQuery(''); setIsSearchActive(false); }}
                      >
                        <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} className="w-12 h-16 object-cover rounded-xl shadow-lg border border-onyx-glass-border" alt={movie.title} />
                        <div className="flex flex-col">
                          <span className="text-sm font-black tracking-tighter line-clamp-1 italic text-onyx-text">{movie.title || movie.name}</span>
                          <span className="text-[8px] font-black text-onyx-purple uppercase tracking-[0.3em] mt-1 opacity-60">Frequency Sync</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-14 h-14 bg-onyx-glass backdrop-blur-3xl rounded-full flex items-center justify-center border border-onyx-glass-border shadow-xl hover:scale-105 transition-all text-onyx-text"
              title={isDarkMode ? "Awaken Pearl" : "Return to Obsidian"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M6.364 6.364l.707.707m11.314 11.314l.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {/* Profile Pillar */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-14 h-14 bg-onyx-glass backdrop-blur-3xl rounded-full flex items-center justify-center border border-onyx-glass-border shadow-xl overflow-hidden hover:scale-105 transition-all p-0"
                >
                  <img src={(avatarSeed || user?.email || 'onyx').startsWith('http') ? (avatarSeed || user?.email || 'onyx') : `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || user?.email || 'onyx'}`} className="w-full h-full object-cover p-1" alt="Profile" />
                </button>

                {isProfileOpen && (
                  <div className="absolute top-20 right-0 w-64 bg-onyx-bg/95 backdrop-blur-3xl rounded-[2rem] p-4 border border-onyx-glass-border shadow-2xl animate-slide-up flex flex-col gap-2">
                    <div className="px-4 py-3 border-b border-onyx-glass-border mb-2">
                      <p className="text-[10px] font-black text-onyx-text-dim uppercase tracking-widest truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full py-3 text-[9px] font-black text-onyx-text-dim uppercase tracking-[0.4em] hover:text-onyx-text hover:bg-onyx-purple/10 rounded-xl px-4 transition-all"
                    >
                      Security Dossier
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 text-[9px] font-black text-onyx-purple uppercase tracking-[0.4em] hover:bg-onyx-purple hover:text-white rounded-xl transition-all border border-onyx-purple/20 px-4"
                    >
                      Terminal Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-8 py-4 bg-onyx-purple rounded-full text-[10px] font-black text-white uppercase tracking-[0.5em] shadow-xl hover:scale-105 transition-all cursor-pointer">
                Watch
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[300] bg-onyx-bg flex flex-col items-center justify-center animate-fade-in transition-colors">
          <div className="w-24 h-24 relative mb-10 animate-pulse">
            <div className="absolute inset-0 bg-onyx-purple/20 blur-3xl animate-ping"></div>
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
              <path d="M50,10 L50,90 M10,50 L90,50" stroke="#8b5cf6" strokeWidth="2" />
            </svg>
          </div>
          <p className="text-[10px] font-black text-onyx-purple uppercase tracking-[1em] animate-pulse">De-Syncing Protocol...</p>
        </div>
      )}

      {/* Main Content Home */}
      <main className="relative z-10 pt-32">{children}</main>

      {/* Mobile Nav Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] md:hidden">
        <div className="bg-onyx-glass backdrop-blur-3xl rounded-full px-10 py-5 border border-onyx-glass-border shadow-2xl flex items-center gap-10">
          <Link to="/"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-onyx-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></Link>
          <Link to="/movies"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-onyx-text-dim hover:text-onyx-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg></Link>
          <Link to="/watchlist"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-onyx-text-dim hover:text-onyx-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg></Link>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
