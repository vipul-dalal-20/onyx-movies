import { useState, useEffect } from 'react';
import * as tmdb from '../services/tmdb';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import FilterBar from '../components/FilterBar';

const ROWS = [
  { key: 'trending_movie', label: 'Trending Now', labelColor: '#f43f5e', categoryPath: '/browse/trending', fetcher: () => tmdb.getTrending('movie') },
  { key: 'trending_tv', label: 'Trending TV Shows', labelColor: '#8b5cf6', categoryPath: '/browse/trending-tv', fetcher: () => tmdb.getTrending('tv') },
  { key: 'popular_movie', label: 'Popular Movies', labelColor: '#06b6d4', categoryPath: '/browse/popular', fetcher: () => tmdb.getPopular('movie') },
  { key: 'top_rated', label: 'Top Rated', labelColor: '#fbbf24', categoryPath: '/browse/top_rated', fetcher: () => tmdb.getTopRated('movie') },
  { key: 'upcoming', label: 'Coming Soon', labelColor: '#10b981', categoryPath: '/browse/upcoming', fetcher: () => tmdb.getUpcoming().then(movies => movies.filter(m => new Date(m.release_date) > new Date())) },
  { key: 'netflix', label: 'Netflix Originals', labelColor: '#ef4444', categoryPath: '/browse/netflix-originals', fetcher: () => tmdb.getNetflixOriginals() },
  { key: 'popular_tv', label: 'Popular on TV', labelColor: '#a78bfa', categoryPath: '/browse/popular-tv', fetcher: () => tmdb.getPopular('tv') },
];

const useContinueWatching = () => {
  const [items] = useState(() => {
    try { return JSON.parse(localStorage.getItem('onyx_continue_watching') || '[]'); }
    catch { return []; }
  });
  return items;
};

const Home = () => {
  const [hero, setHero] = useState(null);
  const [rows, setRows] = useState({});
  const [loadingRows, setLoadingRows] = useState(
    () => Object.fromEntries(ROWS.map(r => [r.key, true]))
  );

  useEffect(() => {
    // Initial fetch for HERO
    tmdb.getTrending('movie').then(items => {
      if (items?.length) setHero(items[Math.floor(Math.random() * 10)]);
    });

    // Individual fetch for ROWS to allow partial loading
    ROWS.forEach(row => {
      row.fetcher().then(data => {
        setRows(prev => ({ ...prev, [row.key]: data }));
        setLoadingRows(prev => ({ ...prev, [row.key]: false }));
      }).catch(err => {
        console.error(`Row ${row.label} fetch error:`, err);
        setLoadingRows(prev => ({ ...prev, [row.key]: false }));
      });
    });
  }, []);

  const continueWatching = useContinueWatching();

  return (
    <div className="min-h-screen" style={{ background: 'var(--onyx-bg)' }}>
      {/* ── Spotlight Hero Area ── */}
      <HeroBanner movie={hero} loading={!hero} />

      {/* ── High-End Row Section ── */}
      <div className="relative z-20 -mt-28 md:-mt-20 pb-24 space-y-8 md:space-y-16">
        {/* Cinematic Discovery Node (Filters) */}
        <FilterBar />

        {/* Continue Watching Section — if exists */}
        {continueWatching.length > 0 && (
          <MovieRow
            title="Continue Watching"
            movies={continueWatching}
            loading={false}
            labelColor="var(--onyx-purple)"
          />
        )}

        {/* Dynamic Rows */}
        {ROWS.map(row => (
          <MovieRow
            key={row.key}
            title={row.label}
            movies={rows[row.key] || []}
            loading={loadingRows[row.key]}
            labelColor={row.labelColor}
            categoryPath={row.categoryPath}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
