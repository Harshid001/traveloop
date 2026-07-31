import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Compass,
  Heart,
  Layers,
  List,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { useGetDestinationsQuery } from '../services/apiSlice';
import AppLayout from '../components/layout/AppLayout';

const CATS = ['All', 'Sightseeing', 'Adventure', 'Beach', 'Food Tour', 'Shopping', 'Nightlife', 'Wellness', 'Family', 'Honeymoon', 'Budget Friendly'];
const SORTS = ['Popular', 'Highest rated', 'Low budget', 'High budget', 'Nearby'];

function categoryMatches(destination, category) {
  if (category === 'All') return true;
  if (category === 'Budget Friendly') return (destination.budgetEstimate || destination.budget || 9999) <= 1800;
  if (category === 'Honeymoon') return ['Paris', 'Bali', 'Maldives', 'Switzerland'].includes(destination.name);
  if (category === 'Family') return ['Singapore', 'London', 'Dubai', 'Goa'].includes(destination.name);
  const acts = destination.activities || [];
  return acts.some((activity) => (activity.category || activity.type || '') === category);
}

export default function ExploreScreen() {
  const navigate = useNavigate();
  const { data: rawDestinations, isLoading: destsLoading } = useGetDestinationsQuery();
  const destinations = useMemo(
    () => (Array.isArray(rawDestinations) ? rawDestinations : (Array.isArray(rawDestinations?.data) ? rawDestinations.data : [])),
    [rawDestinations]
  );
  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('traveloop.saved.destinations') || '{}'); } catch { return {}; }
  });
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Popular');
  const [view, setView] = useState('list');

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = destinations.filter((d) => {
      const matchSearch = !text ||
        `${d.name} ${d.country} ${d.description} ${d.activities.map((a) => `${a.name} ${a.category}`).join(' ')}`.toLowerCase().includes(text);
      return matchSearch && categoryMatches(d, category);
    });

    return [...list].sort((a, b) => {
      if (sort === 'Highest rated') return b.rating - a.rating;
      if (sort === 'Low budget') return a.budgetEstimate - b.budgetEstimate;
      if (sort === 'High budget') return b.budgetEstimate - a.budgetEstimate;
      if (sort === 'Nearby') return Math.abs(a.lat - 20) - Math.abs(b.lat - 20);
      return b.rating * 100 - b.budgetEstimate / 100 - (a.rating * 100 - a.budgetEstimate / 100);
    });
  }, [category, query, sort, destinations]);

  const toggleSaved = (id) => {
    setLiked((current) => {
      const next = { ...current, [id]: !current[id] };
      window.localStorage.setItem('traveloop.saved.destinations', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            aria-label="Back to home"
            onClick={() => navigate('/home')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Explore Destinations</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {destsLoading ? 'Loading...' : `${filtered.length} destinations matched`}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
          <button
            aria-label="List view"
            onClick={() => setView('list')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
              view === 'list'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <List size={16} />
          </button>
          <button
            aria-label="Map view"
            onClick={() => setView('map')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
              view === 'map'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Map size={16} />
          </button>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <section className="mb-6 space-y-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_13rem]">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, country, activity, budget, or rating..."
              className="input-field pl-11"
            />
          </div>
          <label className="relative">
            <SlidersHorizontal size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="input-field pl-11 appearance-none cursor-pointer font-bold"
            >
              {SORTS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {/* Category pills */}
        <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-1">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`min-h-9 snap-start rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                category === c
                  ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Map View */}
      {view === 'map' && (
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md">
          <div className="relative h-[22rem] bg-gradient-to-br from-indigo-50 via-slate-100 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="absolute left-5 top-5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-md">
              <Layers size={16} className="mb-1 text-primary" /> Map Explorer
            </div>
            {filtered.slice(0, 8).map((d, index) => (
              <button
                key={d.id}
                onClick={() => navigate(`/destinations/${d.id}`)}
                className="absolute rounded-full bg-primary px-3 py-2 text-xs font-bold text-white shadow-md transition-transform hover:scale-110"
                style={{ left: `${12 + (index * 11) % 74}%`, top: `${24 + (index * 17) % 55}%` }}
              >
                {d.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-20 text-center">
          <Compass size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">No destinations match</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Try a broader category or a lower budget filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d, i) => (
            <motion.article
              key={d.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-hover"
              onClick={() => navigate(`/destinations/${d.id}`)}
            >
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img src={d.image} alt={d.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                <button
                  aria-label={liked[d.id] ? 'Remove from saved destinations' : 'Save destination'}
                  onClick={(e) => { e.stopPropagation(); toggleSaved(d.id); }}
                  className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md backdrop-blur-sm transition-all hover:scale-110"
                >
                  <Heart size={15} className={liked[d.id] ? 'fill-danger text-danger' : 'text-slate-400 dark:text-slate-500'} />
                </button>
                <span className="absolute left-3 top-3 rounded-full bg-primary/95 text-white px-3 py-1 text-xs font-extrabold shadow-sm backdrop-blur-sm border border-white/20">
                  ${d.budgetEstimate.toLocaleString()}
                </span>
              </div>
              <div className="p-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h2 className="font-poppins text-base font-bold text-slate-900 dark:text-slate-100 transition-colors group-hover:text-primary dark:group-hover:text-primary-light">{d.name}</h2>
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> {d.rating}
                  </span>
                </div>
                <p className="mb-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><MapPin size={11} className="text-primary" />{d.country}</p>
                <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{d.description}</p>
                <div className="flex flex-wrap gap-1">
                  {d.activities.slice(0, 3).map((a) => (
                    <span key={a.name} className="rounded-full bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary dark:text-primary-light">{a.category}</span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

