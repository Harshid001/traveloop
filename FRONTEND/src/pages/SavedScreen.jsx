import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Clock, Heart, MapPin, Search, Sparkles } from 'lucide-react';
import { destinations, latestTrips, topTrips } from '../data/trips';
import MobileBottomNav from '../components/common/MobileBottomNav';

const tabs = ['Destinations', 'Trips', 'Activities', 'Hotels'];

export default function SavedScreen() {
  const navigate = useNavigate();
  const savedTrips = [...topTrips.slice(0, 2), ...latestTrips.slice(0, 2)];
  const savedDestinations = destinations.slice(0, 4).map((item) => ({
    id: `destination-${item.id}`,
    title: item.name,
    subtitle: item.country,
    image: item.image,
    price: `$${item.budgetEstimate.toLocaleString()}`,
    meta: `${item.rating} rating`,
    to: `/destinations/${item.id}`,
    tab: 'Destinations',
  }));
  const items = [
    ...savedDestinations,
    ...savedTrips.map((trip) => ({ id: `trip-${trip.id}`, title: trip.title, subtitle: trip.location, image: trip.image, price: trip.price, meta: trip.duration, to: `/trip/${trip.id}`, tab: 'Trips' })),
    ...destinations.slice(0, 3).flatMap((destination) => destination.activities.slice(0, 1).map((activity) => ({ id: `activity-${destination.id}-${activity.name}`, title: activity.name, subtitle: destination.name, image: activity.image, price: `$${activity.cost}`, meta: activity.category, to: `/destinations/${destination.id}`, tab: 'Activities' }))),
    { id: 'hotel-1', title: 'Boutique hotel placeholder', subtitle: 'Paris', image: destinations[0].image, price: 'Sync soon', meta: 'Hotels', to: '/explore', tab: 'Hotels' },
  ];

  const [activeTab, setActiveTab] = useState('Destinations');
  const [query, setQuery] = useState('');
  const [removed, setRemoved] = useState({});

  const displayedItems = useMemo(() => items.filter((item) => {
    const matchTab = item.tab === activeTab;
    const matchQuery = !query.trim() || `${item.title} ${item.subtitle} ${item.meta}`.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQuery && !removed[item.id];
  }), [activeTab, items, query, removed]);

  const createFromSaved = () => {
    const destinationIds = savedDestinations.map((item) => Number(item.id.replace('destination-', '')));
    window.localStorage.setItem('traveloop.createTrip.seed', JSON.stringify(destinationIds));
    navigate('/create-trip');
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"><ArrowLeft size={18} /></button>
          <h1 className="font-poppins text-lg font-bold text-textDark">Saved</h1>
          <span className="ml-auto flex items-center gap-1 text-xs text-textMuted"><Bookmark size={12} />{displayedItems.length} shown</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 md:pb-12 lg:px-8">
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="input-field pl-11" placeholder="Search saved destinations, trips, hotels..." />
          </div>
          <button onClick={createFromSaved} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark">
            Create trip from saved
          </button>
        </div>

        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`min-h-10 rounded-full px-4 text-xs font-semibold ${activeTab === tab ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-textMuted'}`}>
              {tab}
            </button>
          ))}
        </div>

        {displayedItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <Bookmark size={40} className="mx-auto mb-4 text-slate-200" />
            <p className="font-poppins text-lg font-bold text-textDark">Nothing saved here yet</p>
            <p className="mt-2 text-sm text-textMuted">Save destinations, trips, activities, or hotels and they will appear in these tabs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedItems.map((item, i) => (
              <motion.article key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-hover">
                <div className="relative h-44 cursor-pointer overflow-hidden" onClick={() => navigate(item.to)}>
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                  <button aria-label="Remove saved item" onClick={(e) => { e.stopPropagation(); setRemoved((p) => ({ ...p, [item.id]: true })); }}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform hover:scale-110">
                    <Heart size={15} className="fill-danger text-danger" />
                  </button>
                </div>
                <div className="p-4">
                  <h2 className="font-poppins text-sm font-bold text-textDark">{item.title}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-textMuted"><MapPin size={11} />{item.subtitle}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">{item.price}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} />{item.meta}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
        <div className="mt-6 rounded-3xl border border-primary/10 bg-primary/5 p-5 text-sm font-semibold text-primary">
          <Sparkles size={17} className="mb-2" /> Saved state is consistent with destination cards and ready to persist through `/api/saved`.
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
