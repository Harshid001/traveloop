import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Star, Heart } from 'lucide-react';
import { destinations } from '../data/trips';
import MobileBottomNav from '../components/common/MobileBottomNav';

const CATS = ['All', 'Sightseeing', 'Adventure', 'Beach', 'Food Tour', 'Shopping', 'Nightlife', 'Wellness'];

export default function ExploreScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState({});
  const [category, setCategory] = useState('All');

  const filtered = destinations.filter((d) => {
    const matchSearch = !query.trim() ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.country.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === 'All' || d.activities.some((a) => a.category === category);
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"><ArrowLeft size={18} /></button>
          <div className="flex-1">
            <h1 className="font-poppins text-lg font-bold text-slate-900">Explore</h1>
            <p className="text-xs text-slate-400">{destinations.length} destinations worldwide</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8">
        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-accent/10 transition-all shadow-sm" />
          </div>
          <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-1">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`min-h-11 snap-start px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  category === c ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-hover transition-shadow cursor-pointer group"
              onClick={() => navigate(`/trip/${d.id}`)}>
              <div className="relative h-44 overflow-hidden">
                <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button aria-label={liked[d.id] ? 'Remove from saved trips' : 'Save destination'} onClick={(e) => { e.stopPropagation(); setLiked((p) => ({ ...p, [d.id]: !p[d.id] })); }}
                  className="absolute bottom-3 right-3 tap-target rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                  <Heart size={16} className={liked[d.id] ? 'text-red-500 fill-red-500' : 'text-slate-400'} />
                </button>
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold text-blue-600 rounded-full px-2.5 py-1">
                    ${d.budgetEstimate.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-poppins text-sm font-bold text-slate-900">{d.name}</h3>
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> {d.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-2"><MapPin size={11} />{d.country}</p>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{d.description}</p>
                <div className="flex flex-wrap gap-1">
                  {d.activities.slice(0, 3).map((a) => (
                    <span key={a.name} className="text-[9px] font-medium bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{a.category}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
