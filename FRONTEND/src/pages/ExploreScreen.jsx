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
import { destinations } from '../data/trips';
import MobileBottomNav from '../components/common/MobileBottomNav';

const CATS = ['All', 'Sightseeing', 'Adventure', 'Beach', 'Food Tour', 'Shopping', 'Nightlife', 'Wellness', 'Family', 'Honeymoon', 'Budget Friendly'];
const SORTS = ['Popular', 'Highest rated', 'Low budget', 'High budget', 'Nearby'];

function categoryMatches(destination, category) {
  if (category === 'All') return true;
  if (category === 'Budget Friendly') return destination.budgetEstimate <= 1800;
  if (category === 'Honeymoon') return ['Paris', 'Bali', 'Maldives', 'Switzerland'].includes(destination.name);
  if (category === 'Family') return ['Singapore', 'London', 'Dubai', 'Goa'].includes(destination.name);
  return destination.activities.some((activity) => activity.category === category);
}

export default function ExploreScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState(() => JSON.parse(window.localStorage.getItem('traveloop.saved.destinations') || '{}'));
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
  }, [category, query, sort]);

  const toggleSaved = (id) => {
    setLiked((current) => {
      const next = { ...current, [id]: !current[id] };
      window.localStorage.setItem('traveloop.saved.destinations', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"><ArrowLeft size={18} /></button>
          <div className="flex-1">
            <h1 className="font-poppins text-lg font-bold text-textDark">Explore</h1>
            <p className="text-xs text-textMuted">{filtered.length} destinations matched</p>
          </div>
          <div className="hidden rounded-xl border border-slate-200 bg-white p-1 sm:flex">
            <button aria-label="List view" onClick={() => setView('list')} className={`tap-target rounded-lg ${view === 'list' ? 'bg-primary text-white' : 'text-slate-400'}`}><List size={16} /></button>
            <button aria-label="Map view" onClick={() => setView('map')} className={`tap-target rounded-lg ${view === 'map' ? 'bg-primary text-white' : 'text-slate-400'}`}><Map size={16} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 md:pb-12 lg:px-8">
        <section className="mb-6 space-y-3">
          <div className="grid gap-3 lg:grid-cols-[1fr_13rem]">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, country, activity, budget, or rating..."
                className="input-field pl-11 pr-4" />
            </div>
            <label className="relative">
              <SlidersHorizontal size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="input-field appearance-none pl-11">
                {SORTS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-1">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`min-h-10 snap-start rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  category === c ? 'bg-primary text-white shadow-sm' : 'border border-slate-200 bg-white text-textMuted hover:border-slate-300 hover:bg-slate-50'}`}>
                {c}
              </button>
            ))}
          </div>
        </section>

        {view === 'map' && (
          <section className="mb-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
            <div className="relative h-[22rem] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
              <div className="absolute left-5 top-5 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-textDark shadow-soft backdrop-blur-md">
                <Layers size={16} className="mb-1 text-primary" /> Map/list toggle placeholder
              </div>
              {filtered.slice(0, 8).map((d, index) => (
                <button
                  key={d.id}
                  onClick={() => navigate(`/destinations/${d.id}`)}
                  className="absolute rounded-full bg-primary px-3 py-2 text-xs font-bold text-white shadow-hover transition-transform hover:scale-105"
                  style={{ left: `${12 + (index * 11) % 74}%`, top: `${24 + (index * 17) % 55}%` }}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <Compass size={40} className="mx-auto mb-4 text-slate-200" />
            <p className="font-poppins text-lg font-bold text-textDark">No destinations match</p>
            <p className="mt-2 text-sm text-textMuted">Try a broader category or a lower budget filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d, i) => (
              <motion.article key={d.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-hover"
                onClick={() => navigate(`/destinations/${d.id}`)}>
                <div className="relative h-48 overflow-hidden">
                  <img src={d.image} alt={d.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <button aria-label={liked[d.id] ? 'Remove from saved destinations' : 'Save destination'} onClick={(e) => { e.stopPropagation(); toggleSaved(d.id); }}
                    className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform hover:scale-110">
                    <Heart size={16} className={liked[d.id] ? 'fill-danger text-danger' : 'text-slate-400'} />
                  </button>
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
                    ${d.budgetEstimate.toLocaleString()}
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h2 className="font-poppins text-base font-bold text-textDark transition-colors group-hover:text-primary">{d.name}</h2>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600">
                      <Star size={11} className="fill-amber-500 text-amber-500" /> {d.rating}
                    </span>
                  </div>
                  <p className="mb-2 flex items-center gap-1 text-xs text-textMuted"><MapPin size={11} />{d.country}</p>
                  <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-500">{d.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {d.activities.slice(0, 3).map((a) => (
                      <span key={a.name} className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">{a.category}</span>
                    ))}
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
