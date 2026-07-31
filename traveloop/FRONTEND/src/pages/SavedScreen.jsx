import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Heart, MapPin, Search, Sparkles } from 'lucide-react';
import { useGetSavedQuery } from '../services/apiSlice';
import { FALLBACK_DESTINATIONS as destinations } from '../constants/fallback';
import AppLayout from '../components/layout/AppLayout';

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
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Saved Favorites</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} saved items</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved items..."
          className="input-field pl-11 text-xs py-3"
        />
      </div>

      {/* Tabs */}
      <div className="no-scrollbar flex snap-x gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`min-h-9 snap-start rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === t
                ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-20 text-center">
          <Bookmark size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">No saved items yet</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Explore destinations and save your favorites.</p>
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
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-hover"
              onClick={() => navigate(item.to)}
            >
              <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                <button
                  aria-label="Remove from saved"
                  onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                  className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md backdrop-blur-sm transition-all hover:scale-110"
                >
                  <Heart size={15} className="fill-danger text-danger" />
                </button>
                <span className="absolute left-3 top-3 rounded-full bg-primary/95 text-white px-3 py-1 text-xs font-extrabold shadow-sm backdrop-blur-sm border border-white/20">
                  {item.price}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-poppins text-base font-bold text-slate-900 dark:text-slate-100 transition-colors group-hover:text-primary dark:group-hover:text-primary-light">
                  {item.title}
                </h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin size={11} className="text-primary" />{item.subtitle}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-500" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.meta}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </AppLayout>
  );
}