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
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"><ArrowLeft size={18} /></button>
          <div className="flex-1">
            <h1 className="font-poppins text-lg font-bold text-textDark">Saved</h1>
            <p className="text-xs text-textMuted">{filtered.length} items</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 md:pb-12 lg:px-8">
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search saved items..." className="input-field pl-11" />
        </div>

        <div className="no-scrollbar flex snap-x gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`min-h-10 snap-start rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === t ? 'bg-primary text-white shadow-sm' : 'bg-white text-textMuted border border-slate-200 hover:bg-slate-50'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <Bookmark size={40} className="mx-auto mb-4 text-slate-200" />
            <p className="font-poppins text-lg font-bold text-textDark">No saved items yet</p>
            <p className="mt-2 text-sm text-textMuted">Explore destinations and save your favorites.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <motion.article key={item.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-hover"
                onClick={() => navigate(item.to)}>
                <div className="relative h-40 overflow-hidden">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <button aria-label="Remove from saved" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform hover:scale-110">
                    <Heart size={16} className="fill-danger text-danger" />
                  </button>
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">{item.price}</span>
                </div>
                <div className="p-4">
                  <h2 className="font-poppins text-base font-bold text-textDark transition-colors group-hover:text-primary">{item.title}</h2>
                  <p className="flex items-center gap-1 text-xs text-textMuted"><MapPin size={11} />{item.subtitle}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Sparkles size={12} className="text-warning" />
                    <span className="text-xs text-slate-500">{item.meta}</span>
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