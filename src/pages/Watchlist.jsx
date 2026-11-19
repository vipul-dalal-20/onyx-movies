import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import { StreamCard } from '../components/MovieRow';

const Watchlist = () => {
  const navigate = useNavigate();
  const { items } = useWatchlist();

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--onyx-bg)' }}>
      {/* Header */}
      <div className="relative pt-28 pb-12 px-10 md:px-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.1), transparent 70%)', filter: 'blur(40px)' }} />
        <div className="flex items-end gap-6 mb-2">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic" style={{ color: 'var(--onyx-text)' }}>
            My Queue
          </h1>
          <span className="mb-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
            {items.length} {items.length === 1 ? 'Title' : 'Titles'}
          </span>
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--onyx-text-dim)' }}>
          {items.length > 0 ? 'Your saved titles, ready to watch.' : 'Nothing saved yet — go explore!'}
        </p>
      </div>

      {/* Grid */}
      {items.length > 0 ? (
        <div className="px-4 md:px-12 lg:px-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-5"
            style={{ paddingBottom: '120px' }}>
            {items.map((movie, idx) => (
              <div key={movie.id} style={{ animation: `fadeIn 0.3s ease ${idx * 30}ms forwards`, opacity: 0 }}>
                <StreamCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.1)', border: '2px dashed rgba(139,92,246,0.3)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="#8b5cf6" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black mb-2" style={{ color: 'var(--onyx-text)' }}>Your Queue is Empty</p>
            <p className="text-sm" style={{ color: 'var(--onyx-text-dim)' }}>Browse movies and hit + to add them here</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 8px 25px rgba(139,92,246,0.3)' }}
          >
            Explore Library
          </button>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

export default Watchlist;
