import { useState, useEffect } from 'react';
import * as tmdbService from '../services/tmdb';
import { StreamCard } from '../components/MovieRow';
import { GridSkeleton } from '../components/common/Skeleton';

const TVShowsPage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTV = async () => {
      setIsLoading(true);
      try {
        const data = await tmdbService.getPopular('tv');
        setItems(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTV();
  }, []);

  return (
    <div className="min-h-screen bg-onyx-bg pb-32 pt-32 animate-fade-in transition-colors duration-500">
      <div className="max-w-9xl mx-auto px-6 md:px-12 text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic text-onyx-text mb-4">Episodes</h1>
          <p className="text-[10px] font-black text-onyx-purple uppercase tracking-[0.8em]">Absolute Grade Episodic Anthology</p>
      </div>
      <div className="max-w-9xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {isLoading ? (
                Array(12).fill(0).map((_, i) => <GridSkeleton key={i} />)
            ) : (
                items.map((item) => <StreamCard key={item.id} movie={item} type="tv" />)
            )}
        </div>
      </div>
    </div>
  );
};

export default TVShowsPage;
