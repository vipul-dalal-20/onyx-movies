import { useState, useCallback } from 'react';
import { WatchlistContext } from './WatchlistContext.js';

const load = () => {
  try { return JSON.parse(localStorage.getItem('onyx_watchlist') || '[]'); }
  catch { return []; }
};

const save = (items) => {
  try { localStorage.setItem('onyx_watchlist', JSON.stringify(items)); }
  catch (err) {
    console.error("Failed to save watchlist:", err);
  }
};

export const WatchlistProvider = ({ children }) => {
  const [items, setItems] = useState(load);

  const toggle = useCallback((movie) => {
    setItems(prev => {
      const exists = prev.some(m => String(m.id) === String(movie.id));
      const next = exists
        ? prev.filter(m => String(m.id) !== String(movie.id))
        : [movie, ...prev];
      save(next);
      return next;
    });
  }, []);

  const isInWatchlist = useCallback((id) => {
    return items.some(m => String(m.id) === String(id));
  }, [items]);

  return (
    <WatchlistContext.Provider value={{ items, toggle, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};
