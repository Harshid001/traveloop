import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, CalendarDays, MapPin, Search, StickyNote, X } from 'lucide-react';
import { demoMyTrips, destinations, latestTrips, topTrips } from '../data/trips';
import MobileBottomNav from '../components/common/MobileBottomNav';

const recentSearches = ['Bali beaches', 'budget Tokyo', 'packing passport', 'Europe Explorer'];

export default function GlobalSearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(recentSearches);

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return [];
    const destinationResults = destinations
      .filter((item) => `${item.name} ${item.country} ${item.description} ${item.activities.map((a) => a.category).join(' ')}`.toLowerCase().includes(text))
      .map((item) => ({ id: `destination-${item.id}`, type: 'Destination', title: item.name, subtitle: item.country, image: item.image, to: `/destinations/${item.id}`, icon: MapPin }));
    const tripResults = [...topTrips, ...latestTrips, ...demoMyTrips]
      .filter((item) => `${item.title} ${item.location || ''} ${item.destinations?.join(' ') || ''}`.toLowerCase().includes(text))
      .map((item) => ({ id: `trip-${item.id}`, type: 'Trip', title: item.title, subtitle: item.location || item.destinations?.join(' -> '), image: item.image, to: `/trip/${item.id}`, icon: CalendarDays }));
    const notes = [
      { id: 'note-1', title: 'Passport and visa copies', subtitle: 'Journal note', to: '/journal', icon: StickyNote },
      { id: 'saved-1', title: 'Saved destinations', subtitle: 'Wishlist collection', to: '/saved', icon: Bookmark },
    ].filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(text));
    return [...destinationResults, ...tripResults, ...notes].slice(0, 12);
  }, [query]);

  const submitSearch = (value) => {
    const next = value.trim();
    if (!next) return;
    setQuery(next);
    setRecent((current) => [next, ...current.filter((item) => item !== next)].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button aria-label="Back to dashboard" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100">
            <ArrowLeft size={18} />
          </button>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitSearch(query)}
              placeholder="Search destinations, trips, activities, notes..."
              className="input-field py-3 pl-11 pr-11"
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
        {!query.trim() ? (
          <section>
            <h1 className="font-poppins text-lg font-bold text-textDark">Recent searches</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {recent.map((item) => (
                <button key={item} onClick={() => submitSearch(item)} className="min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-textMuted transition-colors hover:border-primary/20 hover:text-primary">
                  {item}
                </button>
              ))}
            </div>
          </section>
        ) : results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <Search size={38} className="mx-auto mb-4 text-slate-200" />
            <p className="font-poppins text-lg font-bold text-textDark">No results</p>
            <p className="mt-2 text-sm text-textMuted">Try a city, country, trip name, activity, or note keyword.</p>
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
                  className="flex w-full items-center gap-4 rounded-3xl border border-slate-100 bg-white p-3 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-hover"
                >
                  {item.image ? (
                    <img src={item.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                      <Icon size={22} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wider text-primary">{item.type}</span>
                    <span className="block truncate font-poppins text-base font-bold text-textDark">{item.title}</span>
                    <span className="block truncate text-sm text-textMuted">{item.subtitle}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
}
