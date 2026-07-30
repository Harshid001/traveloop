import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Map, Compass, Bookmark,
  Globe, DollarSign, Plane, Route, ClipboardList,
  StickyNote,
} from 'lucide-react';
import { useGetTopTripsQuery, useGetLatestTripsQuery } from '../services/apiSlice';
import MobileBottomNav from '../components/ui/MobileBottomNav';
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

  const { data: topTrips = [], isLoading: topLoading, error: topError, refetch: refetchTop } = useGetTopTripsQuery();
  const { data: latestTrips = [], isLoading: latestLoading, error: latestError, refetch: refetchLatest } = useGetLatestTripsQuery();

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
    { label: 'Total Trips', value: totalTrips, icon: Plane, color: '#4F46E5', suffix: '' },
    { label: 'Budget Spent', value: budgetSpent, icon: DollarSign, color: '#22C55E', suffix: '', prefix: '$' },
    { label: 'Distance', value: distanceTravelled, icon: Globe, color: '#F59E0B', suffix: ' km', format: true },
  ];

  const quickNav = [
    { label: 'Create Trip', icon: Plus, route: '/create-trip', color: 'bg-primary' },
    { label: 'My Trips', icon: Map, route: '/my-trips', color: 'bg-primary-light' },
    { label: 'Itinerary', icon: Route, route: '/itinerary-builder', color: 'bg-accent' },
    { label: 'Budget', icon: DollarSign, route: '/budget', color: 'bg-success' },
    { label: 'Explore', icon: Compass, route: '/explore', color: 'bg-warning' },
    { label: 'Packing', icon: ClipboardList, route: '/packing', color: 'bg-danger' },
    { label: 'Journal', icon: StickyNote, route: '/journal', color: 'bg-sky-500' },
    { label: 'Saved', icon: Bookmark, route: '/saved', color: 'bg-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-16">
        {authNotice && (
          <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            {authNotice}
          </div>
        )}
        <section className="mt-6 mb-8">
          <motion.div
            initial="hidden" animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
          >
            {quickNav.map((item) => (
              <motion.button
                key={item.label}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(item.route)}
                className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-soft transition-all duration-200 hover:shadow-hover hover:border-primary/20 group sm:gap-3 sm:p-4"
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} flex shrink-0 items-center justify-center text-white transition-transform duration-200 group-hover:scale-105`}><item.icon size={18} /></div>
                <span className="min-w-0 truncate font-poppins text-xs font-semibold text-textDark sm:text-sm group-hover:text-primary transition-colors">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </section>

        <DashboardStats stats={stats} />

        <TopDestinationsCarousel
          topTrips={topTrips}
          topLoading={topLoading}
          topError={topError}
          refetchTop={refetchTop}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          navigate={navigate}
        />

        <LatestTripsGrid
          latestTrips={latestTrips}
          latestLoading={latestLoading}
          latestError={latestError}
          refetchLatest={refetchLatest}
          likedTrips={likedTrips}
          toggleLike={toggleLike}
          navigate={navigate}
        />
      </main>
      <MobileBottomNav />
    </div>
  );
}