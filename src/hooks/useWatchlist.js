import { useContext } from 'react';
import { WatchlistContext } from '../context/WatchlistContext.js';

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
};
