import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Map, Compass, Bookmark,
  Globe, DollarSign, Plane, Route, ClipboardList,
  StickyNote, Sparkles
} from 'lucide-react';
import { useGetTopTripsQuery, useGetLatestTripsQuery } from '../services/apiSlice';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import HomeHeader from '../components/features/home/HomeHeader';
import DashboardStats from '../components/features/home/DashboardStats';
import TopDestinationsCarousel from '../components/features/home/TopDestinationsCarousel';
import LatestTripsGrid from '../components/features/home/LatestTripsGrid';
import useCounter from '../hooks/useCounter';
import useSearch from '../hooks/useSearch';
import useProfile from '../hooks/useProfile';
import useLikedTrips from '../hooks/useLikedTrips';

const defaultUser = { firstName: 'Henish', lastName: 'Patel', email: 'henish@example.com', mobile: '+91 98765 43210' };

export default function HomePage() {
  const navigate = useNavigate();
  const { user: authUser, logout, authNotice } = useAuth();
  const [user, setUser] = useState(defaultUser);
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalTrips = useCounter(12);
  const budgetSpent = useCounter(18450);
  const distanceTravelled = useCounter(34000);
  const { likedTrips, toggleLike } = useLikedTrips();

  const { data: rawTopTrips, isLoading: topLoading, error: topError, refetch: refetchTop } = useGetTopTripsQuery();
  const { data: rawLatestTrips, isLoading: latestLoading, error: latestError, refetch: refetchLatest } = useGetLatestTripsQuery();

  const topTrips = Array.isArray(rawTopTrips) ? rawTopTrips : (Array.isArray(rawTopTrips?.data) ? rawTopTrips.data : []);
  const latestTrips = Array.isArray(rawLatestTrips) ? rawLatestTrips : (Array.isArray(rawLatestTrips?.data) ? rawLatestTrips.data : []);

  const allSearchableTrips = [...topTrips, ...latestTrips];
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, filteredTrips, searchRef } = useSearch(allSearchableTrips);

  const {
    profileOpen, setProfileOpen,
    editMode, setEditMode,
    editForm, setEditForm,
    saveProfile,
    profileRef,
  } = useProfile(user);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!topTrips?.length) return;
    const interval = setInterval(() => setCurrentSlide((p) => (p + 1) % topTrips.length), 4500);
    return () => clearInterval(interval);
  }, [topTrips.length]);

  useEffect(() => {
    if (!authUser) return;
    const [firstName = 'Traveler', ...rest] = (authUser.name || defaultUser.firstName).split(' ');
    // eslint-disable-next-line
    setUser({
      firstName,
      lastName: rest.join(' '),
      email: authUser.email || defaultUser.email,
      mobile: authUser.phone || authUser.mobile || defaultUser.mobile,
    });
  }, [authUser]);

  const firstLetter = user.firstName?.charAt(0)?.toUpperCase() || 'U';

  const stats = [
    { label: 'Total Trips', value: totalTrips, icon: Plane, color: '#4F46E5', suffix: '', badge: '+2 this month' },
    { label: 'Budget Spent', value: budgetSpent, icon: DollarSign, color: '#22C55E', suffix: '', prefix: '$', badge: '82% on track' },
    { label: 'Distance Travelled', value: distanceTravelled, icon: Globe, color: '#06B6D4', suffix: ' km', format: true, badge: '12 countries' },
    { label: 'Saved Destinations', value: 8, icon: Bookmark, color: '#7C3AED', suffix: '', badge: '4 wishlist' },
  ];

  const quickNav = [
    { label: 'Create Trip', icon: Plus, route: '/create-trip', color: 'from-indigo-600 to-purple-600', badge: 'New' },
    { label: 'My Trips', icon: Map, route: '/my-trips', color: 'from-purple-600 to-indigo-600', count: '3' },
    { label: 'Itinerary', icon: Route, route: '/itinerary-builder', color: 'from-indigo-600 to-cyan-600', badge: 'AI' },
    { label: 'Budget', icon: DollarSign, route: '/budget', color: 'from-emerald-500 to-teal-600' },
    { label: 'Explore', icon: Compass, route: '/explore', color: 'from-amber-500 to-orange-600' },
    { label: 'Packing', icon: ClipboardList, route: '/packing', color: 'from-rose-500 to-pink-600' },
    { label: 'Journal', icon: StickyNote, route: '/journal', color: 'from-cyan-500 to-blue-600' },
    { label: 'Saved', icon: Bookmark, route: '/saved', color: 'from-purple-500 to-indigo-600' },
  ];

  return (
    <AppLayout>
      <HomeHeader
        user={editForm}
        firstLetter={firstLetter}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        editMode={editMode}
        setEditMode={setEditMode}
        editForm={editForm}
        setEditForm={setEditForm}
        saveProfile={saveProfile}
        handleLogout={handleLogout}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredTrips={filteredTrips}
        profileRef={profileRef}
        searchRef={searchRef}
        navigate={navigate}
      />

      <div className="pt-6">
        {authNotice && (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 px-4 py-3 text-sm font-semibold text-primary dark:text-primary-light flex items-center justify-between">
            <span>{authNotice}</span>
            <span className="text-xs bg-primary/10 px-2.5 py-1 rounded-full font-bold">Logged In</span>
          </div>
        )}

        {/* Desktop Hero Welcome Section */}
        <section className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-700/60">
          <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-12 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-200 border border-white/15 mb-4">
                <span>🌤️ Interlaken: 22°C Sunny</span>
                <span className="opacity-40">|</span>
                <span>✈️ Next trip in 14 days</span>
              </div>
              <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Welcome back, <span className="bg-gradient-to-r from-accent via-indigo-300 to-purple-300 bg-clip-text text-transparent">{user.firstName}</span>! ✈️
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 font-normal leading-relaxed max-w-xl">
                Ready for your next journey? Plan smart itineraries, track travel budgets, and discover handpicked world destinations.
              </p>

              {/* AI Trip Planner Quick Search Bar */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl max-w-xl">
                <input
                  type="text"
                  placeholder="✨ Ask Traveloop AI: 'Create 5-day Japan itinerary'..."
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate('/itinerary-builder');
                  }}
                />
                <button
                  onClick={() => navigate('/itinerary-builder')}
                  className="shrink-0 bg-gradient-to-r from-primary via-secondary to-accent text-white font-poppins text-xs font-bold px-5 py-3 rounded-xl hover:shadow-glow hover:scale-105 active:scale-95 transition-all text-center"
                >
                  Generate Plan
                </button>
              </div>
            </div>

            {/* Upcoming Trip Card Preview Widget for Desktop */}
            <div className="hidden lg:block shrink-0 w-80 bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-200 mb-2 uppercase tracking-wider">
                <span>Upcoming Adventure</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">Confirmed</span>
              </div>
              <h3 className="font-poppins text-lg font-bold text-white leading-snug">Tokyo & Mt. Fuji Exploration</h3>
              <p className="text-xs text-slate-300 mt-1">Jun 15 — Jun 28, 2026 (14 Days)</p>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">Pre-trip Packing</span>
                <span className="font-bold text-white">8/10 items</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full w-[80%]" />
              </div>
            </div>
          </div>
        </section>

        {/* Spacious Quick Navigation Cards */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Quick Actions</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">All tools at your fingertips</span>
          </div>
          <motion.div
            initial="hidden" animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4"
          >
            {quickNav.map((item) => (
              <motion.button
                key={item.label}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(item.route)}
                className="relative flex flex-col items-center justify-center text-center rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 p-4 shadow-soft transition-all duration-200 hover:shadow-hover hover:border-primary/40 dark:hover:border-primary/50 group cursor-pointer"
              >
                {item.badge && (
                  <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-primary text-white px-1.5 py-0.5 rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex shrink-0 items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shadow-md mb-2.5`}>
                  <item.icon size={22} />
                </div>
                <span className="font-poppins text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors whitespace-nowrap">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* Dashboard 4-Metric Overview */}
        <DashboardStats stats={stats} />

        {/* Featured Top Destinations Carousel */}
        <TopDestinationsCarousel
          topTrips={topTrips}
          topLoading={topLoading}
          topError={topError}
          refetchTop={refetchTop}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          navigate={navigate}
          likedTrips={likedTrips}
          toggleLike={toggleLike}
        />

        {/* Latest & Category Filtered Trips Grid */}
        <LatestTripsGrid
          latestTrips={latestTrips}
          latestLoading={latestLoading}
          latestError={latestError}
          refetchLatest={refetchLatest}
          likedTrips={likedTrips}
          toggleLike={toggleLike}
          navigate={navigate}
        />
      </div>
    </AppLayout>
  );
}