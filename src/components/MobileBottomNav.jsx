import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Library, User } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Films', path: '/movies', icon: Film },
    { name: 'TV', path: '/tv', icon: Tv },
    { name: 'Search', path: '/search', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ) },
    { name: 'Vault', path: '/watchlist', icon: Library },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[92vw]">
      <div className="flex items-center justify-around bg-onyx-glass backdrop-blur-3xl border border-onyx-glass-border px-2 py-3.5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center gap-1.5 px-3 py-1.5 transition-all duration-500 rounded-2xl ${
                isActive ? 'text-onyx-purple scale-110' : 'text-onyx-text-dim'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-onyx-purple/10 rounded-2xl blur-lg -z-10 animate-pulse"></div>
              )}
              <Icon size={18} strokeWidth={isActive ? 3 : 2} className="transition-transform duration-500" />
              <span className={`text-[7px] font-black uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
