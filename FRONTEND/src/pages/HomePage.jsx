import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bell, Search, Plus, Map, Compass, Bookmark, TrendingUp,
  MapPin, Star, Heart, Clock, ChevronRight, Phone, Mail, LogOut,
  PenLine, Globe, DollarSign, Plane, X, Route, ClipboardList,
  StickyNote, User,
} from 'lucide-react';
import { topTrips, latestTrips } from '../data/trips';
import MobileBottomNav from '../components/common/MobileBottomNav';

/* ===== Animated Counter Hook ===== */
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ===== Mock user ===== */
const defaultUser = { firstName: 'Henish', lastName: 'Patel', email: 'henish@example.com', mobile: '+91 98765 43210' };

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(defaultUser);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likedTrips, setLikedTrips] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const totalTrips = useCounter(12);
  const budgetSpent = useCounter(18450);
  const distanceTravelled = useCounter(34000);

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((p) => (p + 1) % topTrips.length), 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', handler);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const toggleLike = (id) => setLikedTrips((p) => ({ ...p, [id]: !p[id] }));
  const handleLogout = () => { setProfileOpen(false); navigate('/login'); };
  const firstLetter = user.firstName?.charAt(0)?.toUpperCase() || 'U';
  const saveProfile = () => { setUser(editForm); setEditMode(false); };

  const allSearchableTrips = [...topTrips, ...latestTrips];
  const filteredTrips = searchQuery.trim()
    ? allSearchableTrips.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.activities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())))
    : [];

  /* Stats */
  const stats = [
    { label: 'Total Trips', value: totalTrips, icon: Plane, color: '#4F46E5', suffix: '' },
    { label: 'Budget Spent', value: budgetSpent, icon: DollarSign, color: '#06d6a0', suffix: '', prefix: '$' },
    { label: 'Distance', value: distanceTravelled, icon: Globe, color: '#F59E0B', suffix: ' km', format: true },
  ];

  /* Quick Nav */
  const quickNav = [
    { label: 'Create Trip', icon: Plus, route: '/create-trip', color: 'bg-blue-600' },
    { label: 'My Trips', icon: Map, route: '/my-trips', color: 'bg-primary-light' },
    { label: 'Itinerary', icon: Route, route: '/itinerary-builder', color: 'bg-[#8b5cf6]' },
    { label: 'Budget', icon: DollarSign, route: '/budget', color: 'bg-[#06d6a0]' },
    { label: 'Explore', icon: Compass, route: '/explore', color: 'bg-[#F59E0B]' },
    { label: 'Packing', icon: ClipboardList, route: '/packing', color: 'bg-[#ef4444]' },
    { label: 'Journal', icon: StickyNote, route: '/journal', color: 'bg-[#0ea5e9]' },
    { label: 'Saved', icon: Bookmark, route: '/saved', color: 'bg-[#d97706]' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Profile */}
          <div className="relative shrink-0" ref={profileRef}>
            <button aria-label="Open profile menu" onClick={() => { setProfileOpen((p) => !p); setEditMode(false); }}
              className="tap-target rounded-full bg-blue-600 text-white font-poppins font-bold text-sm flex items-center justify-center hover:bg-blue-600-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2">
              {firstLetter}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }} transition={{ duration: 0.15 }}
                  className="fixed left-4 right-4 top-20 z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:absolute sm:left-0 sm:right-auto sm:top-14 sm:w-80">
                  <div className="bg-gradient-to-br from-accent to-purple-600 p-5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold font-poppins text-white">{firstLetter}</div>
                      <button aria-label="Edit profile summary" onClick={() => setEditMode(!editMode)} className="tap-target rounded-full text-white/70 hover:text-white transition-colors"><PenLine size={16} /></button>
                    </div>
                    <p className="font-poppins font-semibold text-white text-base mt-3">{user.firstName} {user.lastName}</p>
                    <p className="text-white/60 text-xs mt-0.5">{user.email}</p>
                  </div>
                  {editMode ? (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="input-field text-xs py-2.5 pl-3" placeholder="First Name" />
                        <input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="input-field text-xs py-2.5 pl-3" placeholder="Last Name" />
                      </div>
                      <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field text-xs py-2.5 pl-3" placeholder="Email" />
                      <input value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} className="input-field text-xs py-2.5 pl-3" placeholder="Phone" />
                      <div className="flex gap-2 pt-1">
                        <button onClick={saveProfile} className="flex-1 bg-blue-600 text-white text-xs font-semibold rounded-full py-2.5 hover:bg-blue-600-hover transition-colors">Save</button>
                        <button onClick={() => { setEditMode(false); setEditForm(user); }} className="flex-1 border border-gray-200 text-gray-500 text-xs font-semibold rounded-full py-2.5 hover:bg-gray-50 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-1">
                      <div className="flex min-w-0 items-center gap-3 text-gray-500 text-sm py-2 px-2"><Phone size={15} className="shrink-0 text-gray-400" /><span className="truncate">{user.mobile}</span></div>
                      <div className="flex min-w-0 items-center gap-3 text-gray-500 text-sm py-2 px-2"><Mail size={15} className="shrink-0 text-gray-400" /><span className="truncate">{user.email}</span></div>
                      <hr className="border-gray-100 my-2" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 text-red-500 text-sm font-medium py-2.5 px-2 rounded-xl hover:bg-red-50 transition-colors"><LogOut size={15} /> Log Out</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logo */}
          <div className="hidden items-center gap-2 shrink-0 sm:flex">
            <Send size={20} className="text-blue-600" />
            <span className="font-poppins text-lg font-bold text-blue-600 tracking-tight hidden sm:inline">Traveloop</span>
          </div>

          {/* Search */}
          <div className="relative min-w-0 flex-1 max-w-md" ref={searchRef}>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)}
                placeholder="Search cities, activities..."
                className="w-full bg-slate-50 border border-slate-100 rounded-full py-2.5 pl-11 pr-10 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
              {searchQuery && (
                <button aria-label="Clear search" onClick={() => { setSearchQuery(''); setSearchOpen(false); }} className="absolute right-1 top-1/2 flex min-h-9 min-w-9 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-600"><X size={14} /></button>
              )}
            </div>
            <AnimatePresence>
              {searchOpen && searchQuery.trim() && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 max-h-72 overflow-y-auto">
                  {filteredTrips.length > 0 ? (
                    filteredTrips.map((t) => (
                      <button key={t.id} onClick={() => { navigate(`/trip/${t.id}`); setSearchOpen(false); setSearchQuery(''); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                        <img src={t.image} alt={t.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{t.location}</p>
                        </div>
                        <span className="ml-auto text-xs font-semibold text-blue-600 shrink-0">{t.price}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">No results for &quot;{searchQuery}&quot;</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button aria-label="Open profile page" onClick={() => navigate('/profile')} className="tap-target rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"><User size={18} /></button>
          <button aria-label="Notifications" className="tap-target hidden rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0 sm:flex items-center justify-center"><Bell size={18} /></button>
        </div>
      </header>

      {/* ==================== MAIN ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-24">

        {/* Quick Nav */}
        <section className="mt-6 mb-8">
          <motion.div 
            initial="hidden" animate="visible" 
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
          >
            {quickNav.map((item) => (
              <motion.button 
                key={item.label} 
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -4, scale: 1.02 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => navigate(item.route)}
                className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-1 group sm:gap-3 sm:p-4"
              >
                <div className={`tap-target rounded-xl ${item.color} flex shrink-0 items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}><item.icon size={18} /></div>
                <span className="min-w-0 truncate font-poppins text-xs font-semibold text-slate-800 sm:text-sm group-hover:text-blue-600 transition-colors">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* Animated Stats */}
        <section className="mb-8">
          <h2 className="font-poppins text-lg font-bold text-gray-900 mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 overflow-hidden relative group cursor-default transition-all duration-300 hover:shadow-xl"
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out" style={{ backgroundColor: s.color }} />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300" style={{ backgroundColor: s.color + '15' }}>
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                  <TrendingUp size={16} className="text-green-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="font-poppins text-3xl font-bold text-gray-900 relative z-10">
                  {s.prefix || ''}{s.format ? s.value.toLocaleString() : s.value}{s.suffix}
                </p>
                <p className="text-xs text-gray-400 mt-1 relative z-10 group-hover:text-gray-600 transition-colors">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Destinations Carousel */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-poppins text-lg font-bold text-gray-900">Top Destinations</h2>
              <p className="text-gray-400 text-xs mt-0.5">Handpicked experiences for you</p>
            </div>
            <div className="flex gap-1.5">
              {topTrips.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-accent w-6' : 'bg-gray-200 w-2'}`} />
              ))}
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-3xl shadow-soft group hover:shadow-xl transition-shadow duration-500">
            <AnimatePresence mode="wait">
              <motion.div key={currentSlide} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative w-full aspect-[16/9] md:aspect-[21/9] cursor-pointer overflow-hidden" onClick={() => navigate(`/trip/${topTrips[currentSlide].id}`)}>
                <motion.img 
                  whileHover={{ scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }}
                  src={topTrips[currentSlide].image} alt={topTrips[currentSlide].title} className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 pointer-events-none">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full px-3 py-1 border border-white/10">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" /> {topTrips[currentSlide].rating}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full px-3 py-1 border border-white/10">
                      <Clock size={12} /> {topTrips[currentSlide].duration}
                    </span>
                  </div>
                  <h3 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 drop-shadow-md">{topTrips[currentSlide].title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-white/90 text-sm sm:text-base flex items-center gap-1.5"><MapPin size={16} />{topTrips[currentSlide].location}</p>
                    <span className="font-poppins text-xl sm:text-2xl font-bold text-white drop-shadow-md">{topTrips[currentSlide].price}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Latest Trips Grid */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-poppins text-lg font-bold text-gray-900">Latest Trips</h2>
              <p className="text-gray-400 text-xs mt-0.5">Explore fresh new adventures</p>
            </div>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          >
            {latestTrips.map((trip) => (
              <motion.div key={trip.id} 
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-48 sm:h-52 cursor-pointer overflow-hidden" onClick={() => navigate(`/trip/${trip.id}`)}>
                  <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                  <button aria-label={likedTrips[trip.id] ? 'Remove from saved trips' : 'Save trip'} onClick={(e) => { e.stopPropagation(); toggleLike(trip.id); }}
                    className="absolute bottom-3 right-3 tap-target rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white active:scale-95 transition-all">
                    <Heart size={18} className={likedTrips[trip.id] ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                  </button>
                  <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold rounded-full px-3 py-1.5 shadow-md">{trip.price}</div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-poppins text-base font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">{trip.title}</h3>
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 rounded-full px-2 py-1 border border-amber-100">
                      <Star size={12} className="fill-amber-500 text-amber-500" /> {trip.rating}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs flex items-center gap-1.5 mb-3"><MapPin size={14} />{trip.location}</p>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{trip.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-gray-400 text-xs font-medium flex items-center gap-1.5"><Clock size={14} className="text-gray-300" />{trip.duration}</span>
                    <button onClick={() => navigate(`/trip/${trip.id}`)} className="text-blue-600 text-sm font-bold hover:underline inline-flex items-center gap-1 group/btn">
                      View <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
      <MobileBottomNav />
    </div>
  );
}
