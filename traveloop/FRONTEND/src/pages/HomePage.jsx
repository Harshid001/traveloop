import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Globe, DollarSign, Plane } from 'lucide-react';
import { useGetTopTripsQuery, useGetLatestTripsQuery, useGetDashboardSummaryQuery } from '../services/apiSlice';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import HomeHeader from '../components/features/home/HomeHeader';
import DashboardStats from '../components/features/home/DashboardStats';
import TopDestinationsCarousel from '../components/features/home/TopDestinationsCarousel';
import useSearch from '../hooks/useSearch';
import useProfile from '../hooks/useProfile';
import useLikedTrips from '../hooks/useLikedTrips';

const defaultUser = { firstName: 'Traveler', lastName: '', email: '', mobile: '' };

export default function HomePage() {
  const navigate = useNavigate();
  const { user: authUser, logout, authNotice } = useAuth();
  const [user, setUser] = useState(defaultUser);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboardSummaryQuery();

  const totalTrips = dashboard?.totalTrips ?? 0;
  const savedPlaces = dashboard?.savedPlaces ?? 0;
  const totalSpent = dashboard?.budgetSummary?.totalSpent ?? 0;
  const upcomingTrips = dashboard?.upcomingTrips ?? 0;
  const { likedTrips, toggleLike } = useLikedTrips();

  const { data: rawTopTrips, isLoading: topLoading, error: topError, refetch: refetchTop } = useGetTopTripsQuery();
  const { data: rawLatestTrips } = useGetLatestTripsQuery();

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
    const [firstName = 'Traveler', ...rest] = (authUser.name || '').split(' ');
    // eslint-disable-next-line
    setUser({
      firstName,
      lastName: rest.join(' '),
      email: authUser.email || '',
      mobile: authUser.phone || authUser.mobile || '',
    });
  }, [authUser]);

  const upcomingTrip = dashboard?.upcomingTrip ?? null;

  const firstLetter = user.firstName?.charAt(0)?.toUpperCase() || 'U';

  const stats = [
    { label: 'Total Trips', value: totalTrips, icon: Plane, color: '#4F46E5', suffix: '', badge: `${upcomingTrips} upcoming` },
    { label: 'Budget Spent', value: totalSpent, icon: DollarSign, color: '#22C55E', suffix: '', prefix: '$', format: true, badge: dashboardLoading ? 'Loading...' : 'from real budgets' },
    { label: 'Saved Destinations', value: savedPlaces, icon: Bookmark, color: '#7C3AED', suffix: '', badge: 'bookmarked' },
    { label: 'Upcoming Trips', value: upcomingTrips, icon: Globe, color: '#06B6D4', suffix: '', badge: 'planned' },
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
                <span>✈️ {upcomingTrip ? `Next trip: ${upcomingTrip.title || upcomingTrip.destination || 'upcoming adventure'}` : `${totalTrips} trip${totalTrips === 1 ? '' : 's'} planned`}</span>
              </div>
              <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Welcome back, <span className="bg-gradient-to-r from-accent via-indigo-300 to-purple-300 bg-clip-text text-transparent">{user.firstName}</span>! ✈️
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 font-normal leading-relaxed max-w-xl">
                Ready for your next journey? Plan smart itineraries, track travel budgets, and discover handpicked world destinations.
              </p>

              {/* Trip Planner Quick Search Bar */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl max-w-xl">
                <input
                  type="text"
                  placeholder="✨ 'Create 5-day Japan itinerary'..."
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
            {upcomingTrip && (
              <div className="hidden lg:block shrink-0 w-80 bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-200 mb-2 uppercase tracking-wider">
                  <span>Upcoming Adventure</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">Planned</span>
                </div>
                <h3 className="font-poppins text-lg font-bold text-white leading-snug">{upcomingTrip.title || upcomingTrip.destination || 'Upcoming Trip'}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  {upcomingTrip.startDate ? new Date(upcomingTrip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                  {upcomingTrip.endDate ? ` — ${new Date(upcomingTrip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
                  {upcomingTrip.days && ` (${upcomingTrip.days} Days)`}
                </p>

                <button
                  onClick={() => navigate(`/trip/${upcomingTrip._id}`)}
                  className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all"
                >
                  View Trip →
                </button>
              </div>
            )}
          </div>
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
      </div>
    </AppLayout>
  );
}