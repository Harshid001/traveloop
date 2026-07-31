import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, DollarSign, Plane, Clock, ChevronRight, Route as RouteIcon, Copy, Edit3, Share2, Trash2, FolderOpen } from 'lucide-react';
import { useGetTripsQuery } from '../services/apiSlice';
import MobileBottomNav from '../components/ui/MobileBottomNav';
import ShareModal from '../components/ui/ShareModal';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'draft', label: 'Drafts' },
];

const STATUS_STYLES = {
  upcoming: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500', label: 'Upcoming' },
  active: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Active' },
  completed: { bg: 'bg-slate-100 dark:bg-slate-700/60', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', label: 'Completed' },
  draft: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', label: 'Draft' },
};

export default function MyTripsScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const { data: rawApiTrips } = useGetTripsQuery();
  const apiTrips = useMemo(
    () => (Array.isArray(rawApiTrips) ? rawApiTrips : (Array.isArray(rawApiTrips?.data) ? rawApiTrips.data : [])),
    [rawApiTrips]
  );
  const [tripsState, setTripsState] = useState([]);
  const [shareTrip, setShareTrip] = useState(null);

  useEffect(() => { if (apiTrips?.length) setTripsState(apiTrips); }, [apiTrips]); // eslint-disable-line react-hooks/set-state-in-effect

  const trips = tab === 'all' ? tripsState : tripsState.filter((t) => t.status === tab);
  const duplicateTrip = (trip) => setTripsState((current) => [{ ...trip, id: Date.now(), title: `${trip.title} Copy`, status: 'draft' }, ...current]);
  const deleteTrip = (id) => setTripsState((current) => current.filter((trip) => trip.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <button
            aria-label="Back to home"
            onClick={() => navigate('/home')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="font-poppins text-lg font-bold text-slate-900 dark:text-white">My Trips</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{tripsState.length} trips total</p>
          </div>
          <button
            onClick={() => navigate('/create-trip')}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] shadow-sm shadow-indigo-600/25"
          >
            <Plane size={13} /> New Trip
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
        {/* Status Tabs */}
        <div className="no-scrollbar flex snap-x gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`min-h-9 snap-start px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                tab === t.key
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              {t.label}{' '}
              {t.key !== 'all' && (
                <span className="ml-1 opacity-60">({tripsState.filter((tr) => tr.status === t.key).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <FolderOpen size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">No trips found</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {tab === 'all' ? 'Create your first trip to get started.' : `No ${tab} trips yet.`}
            </p>
          </div>
        )}

        {/* Trip Cards */}
        <div className="space-y-4">
          {trips.map((trip, i) => {
            const st = STATUS_STYLES[trip.status] || STATUS_STYLES.draft;
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/60 dark:bg-slate-800 dark:border-slate-700/60 dark:hover:border-indigo-500/30"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Trip Image */}
                  <div className="sm:w-56 h-48 sm:h-auto relative overflow-hidden shrink-0">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-1 ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1 p-4 sm:p-5">
                    <h3 className="font-poppins text-base font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors dark:text-white dark:group-hover:text-indigo-400">
                      {trip.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className="text-xs text-slate-500 flex items-center gap-1 dark:text-slate-400">
                        <Calendar size={12} />{trip.startDate} – {trip.endDate}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 dark:text-slate-400">
                        <MapPin size={12} />{trip.destinations.length} cities
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 dark:text-slate-400">
                        <RouteIcon size={12} />{trip.distance}
                      </span>
                    </div>

                    {/* Destination tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {trip.destinations.map((d, j) => (
                        <span key={j} className="text-[10px] font-medium bg-indigo-50 text-indigo-600 rounded-full px-2.5 py-1 dark:bg-indigo-900/30 dark:text-indigo-400">{d}</span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-auto pt-2">
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        <span className="text-sm font-bold text-indigo-600 flex items-center gap-1 dark:text-indigo-400">
                          <DollarSign size={14} />${trip.totalBudget.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 dark:text-slate-400">
                          <Clock size={12} />{trip.activities} activities
                        </span>
                      </div>
                      <span className="text-indigo-600 text-xs font-semibold flex items-center gap-0.5 group-hover:underline dark:text-indigo-400">
                        View Details <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/60">
                      {[
                        { label: trip.status === 'draft' ? 'Continue draft' : 'Edit', icon: Edit3, action: () => navigate('/create-trip') },
                        { label: 'Duplicate', icon: Copy, action: () => duplicateTrip(trip) },
                        { label: 'Share', icon: Share2, action: () => setShareTrip(trip) },
                        { label: 'Delete', icon: Trash2, action: () => deleteTrip(trip.id), danger: true },
                      ].map((action) => (
                        <button
                          key={action.label}
                          onClick={(event) => { event.stopPropagation(); action.action(); }}
                          className={`flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors ${
                            action.danger
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30'
                              : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400'
                          }`}
                        >
                          <action.icon size={13} /> {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <MobileBottomNav />
      <ShareModal
        open={Boolean(shareTrip)}
        onClose={() => setShareTrip(null)}
        tripTitle={shareTrip?.title}
        tripUrl={shareTrip ? `${window.location.origin}/trip/${shareTrip.id}` : ''}
      />
    </div>
  );
}
