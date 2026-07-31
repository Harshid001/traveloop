import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Heart, MapPin, Search, Sparkles } from 'lucide-react';
import { useGetSavedQuery } from '../services/apiSlice';
import { FALLBACK_DESTINATIONS as destinations } from '../constants/fallback';
import MobileBottomNav from '../components/ui/MobileBottomNav';

const tabs = ['Destinations', 'Trips', 'Activities', 'Hotels'];

export default function SavedScreen() {
  const navigate = useNavigate();
  const { data: savedItems = [] } = useGetSavedQuery();
  const [activeTab, setActiveTab] = useState('Destinations');
  const [query, setQuery] = useState('');
  const [removed, setRemoved] = useState({});

  const savedDestinations = (savedItems || []).filter((i) => i.type === 'destination').slice(0, 4).map((item) => ({
    id: `destination-${item.id}`,
    title: item.name,
    subtitle: item.country,
    image: item.image,
    price: item.budgetEstimate ? `$${item.budgetEstimate.toLocaleString()}` : '',
    meta: `${item.rating || '?'} rating`,
    to: `/destinations/${item.id}`,
    tab: 'Destinations',
  }));

  const items = useMemo(() => [
    ...savedDestinations,
    ...destinations.slice(0, 3).flatMap((d) => (d.activities || []).slice(0, 1).map((a) => ({
      id: `activity-${d.id}-${a.name}`,
      title: a.name,
      subtitle: d.name,
      image: a.image,
      price: `$${a.cost}`,
      meta: a.category,
      to: `/destinations/${d.id}`,
      tab: 'Activities',
    }))),
    { id: 'hotel-1', title: 'Boutique hotel placeholder', subtitle: 'Paris', image: destinations[0]?.image, price: 'Sync soon', meta: 'Hotels', to: '/explore', tab: 'Hotels' },
  ], [savedDestinations]);

  const filtered = useMemo(() => {
    return items.filter(
      (item) =>
        (!removed[item.id] && item.tab === activeTab) &&
        (query.trim() === '' || (item.title || '').toLowerCase().includes(query.toLowerCase())),
    );
  }, [items, removed, activeTab, query]);

  const removeItem = (id) => setRemoved((prev) => ({ ...prev, [id]: true }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            aria-label="Back to home"
            onClick={() => navigate('/home')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="font-poppins text-lg font-bold text-slate-900 dark:text-white">Saved</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} items</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 md:pb-12 lg:px-8">
        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved items..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-indigo-400"
          />
        </div>

        {/* Tabs */}
        <div className="no-scrollbar flex snap-x gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`min-h-9 snap-start rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === t
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <Bookmark size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">No saved items yet</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Explore destinations and save your favorites.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/60 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800 dark:hover:border-indigo-500/30"
                onClick={() => navigate(item.to)}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button
                    aria-label="Remove from saved"
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:scale-110 dark:bg-slate-800/90"
                  >
                    <Heart size={15} className="fill-rose-500 text-rose-500" />
                  </button>
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-indigo-600 shadow-sm backdrop-blur-sm dark:bg-slate-800/90 dark:text-indigo-400">
                    {item.price}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="font-poppins text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {item.title}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={11} />{item.subtitle}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Sparkles size={12} className="text-amber-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.meta}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
}