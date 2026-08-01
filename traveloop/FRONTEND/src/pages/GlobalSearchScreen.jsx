import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, MapPin, Search, X } from 'lucide-react';
import { useGetDestinationsQuery, useGetTripsQuery } from '../services/apiSlice';
import AppLayout from '../components/layout/AppLayout';

export default function GlobalSearchScreen() {
  const navigate = useNavigate();
  const { data: destinations = [] } = useGetDestinationsQuery();
  const { data: trips = [] } = useGetTripsQuery({});
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState([]);

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return [];
    const destinationResults = destinations
      .filter((item) => `${item.name} ${item.country} ${item.description} ${(item.activities || []).map((a) => a.category).join(' ')}`.toLowerCase().includes(text))
      .map((item) => ({ id: `destination-${item.id}`, type: 'Destination', title: item.name, subtitle: item.country, image: item.image, to: `/destinations/${item.id}`, icon: MapPin }));
    const tripResults = trips
      .filter((item) => `${item.title || ''} ${item.location || ''} ${(item.destinations || []).join(' ')}`.toLowerCase().includes(text))
      .map((item) => ({ id: `trip-${item._id || item.id}`, type: 'Trip', title: item.title, subtitle: item.location || (item.destinations || []).join(' -> '), image: item.image, to: `/trip/${item._id || item.id}`, icon: CalendarDays }));
    return [...destinationResults, ...tripResults].slice(0, 12);
  }, [query, destinations, trips]);

  const submitSearch = (value) => {
    const next = value.trim();
    if (!next) return;
    setQuery(next);
    setRecent((current) => [next, ...current.filter((item) => item !== next)].slice(0, 6));
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button aria-label="Back to dashboard" onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Global Search</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Search across destinations, trips, and journals</p>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submitSearch(query)}
          placeholder="Search destinations, trips, activities, notes..."
          className="input-field py-3 pl-12 pr-12 text-sm"
        />
        {query && (
          <button aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={16} />
          </button>
        )}
      </div>

      {!query.trim() ? (
        <section>
          <h2 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Recent Searches</h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((item) => (
              <button key={item} onClick={() => submitSearch(item)} className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                {item}
              </button>
            ))}
          </div>
        </section>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-6 py-16 text-center">
          <Search size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">No results found</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Try a city, country, trip name, activity, or note keyword.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => navigate(item.to)}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-3.5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-hover hover:border-primary/40 dark:hover:border-primary/50"
              >
                {item.image ? (
                  <img src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                    <Icon size={22} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-primary-light">{item.type}</span>
                  <span className="block truncate font-poppins text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

