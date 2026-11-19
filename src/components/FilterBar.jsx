import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 878, name: 'Sci-Fi' },
  { id: 27, name: 'Horror' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 10749, name: 'Romance' },
  { id: 9648, name: 'Mystery' },
  { id: 16, name: 'Animation' },
];

const LANGUAGES = [
  { id: '', name: 'All Languages' },
  { id: 'en', name: 'English' },
  { id: 'hi', name: 'Hindi' },
  { id: 'es', name: 'Spanish' },
  { id: 'ja', name: 'Japanese' },
  { id: 'ko', name: 'Korean' },
];

const FilterBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeGenre = searchParams.get('genre') ? parseInt(searchParams.get('genre'), 10) : null;
  const activeLang = searchParams.get('lang') || '';
  const year = searchParams.get('year') || '';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleFilter = (type, value) => {
    const params = new URLSearchParams(searchParams);

    if (type === 'genre') {
      if (activeGenre === value) {
        params.delete('genre');
      } else {
        params.set('genre', value);
      }
    }
    if (type === 'lang') {
      if (value === '') {
        params.delete('lang');
      } else {
        params.set('lang', value);
      }
    }
    if (type === 'year') {
      if (value === '') {
        params.delete('year');
      } else {
        params.set('year', value);
      }
    }

    if (location.pathname === '/search') {
      setSearchParams(params);
    } else {
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="w-full py-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-16">
        {/* Genre Chips */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleFilter('genre', genre.id)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${
                activeGenre === genre.id 
                ? 'bg-onyx-purple border-transparent text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] scale-105' 
                : 'bg-onyx-glass/40 border-onyx-glass-border text-onyx-text-dim hover:border-onyx-purple hover:text-onyx-text'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="relative group">
            <select 
              value={activeLang}
              onChange={(e) => handleFilter('lang', e.target.value)}
              className="appearance-none bg-onyx-glass border border-onyx-glass-border text-onyx-text text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-2xl outline-none cursor-pointer hover:border-onyx-purple transition-all backdrop-blur-xl"
            >
              {LANGUAGES.map(l => <option key={l.id} value={l.id} className="bg-onyx-deep text-onyx-text">{l.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7"/>
                </svg>
            </div>
          </div>

          <div className="relative group">
            <select 
              value={year}
              onChange={(e) => handleFilter('year', e.target.value)}
              className="appearance-none bg-onyx-glass border border-onyx-glass-border text-onyx-text text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-2xl outline-none cursor-pointer hover:border-onyx-purple transition-all backdrop-blur-xl"
            >
              <option value="" className="bg-onyx-deep text-onyx-text">All Years</option>
              {years.map(y => <option key={y} value={y} className="bg-onyx-deep text-onyx-text">{y}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7"/>
                </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
