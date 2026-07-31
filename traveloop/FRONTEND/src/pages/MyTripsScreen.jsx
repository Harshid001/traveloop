import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, DollarSign, Plane, Clock, ChevronRight, Route as RouteIcon, Copy, Edit3, Share2, Trash2, FolderOpen } from 'lucide-react';
import { useGetTripsQuery } from '../services/apiSlice';
import AppLayout from '../components/layout/AppLayout';
import ShareModal from '../components/ui/ShareModal';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'draft', label: 'Drafts' },
];

const STATUS_STYLES = {
  upcoming: { bg: 'bg-primary/10 dark:bg-primary/20', text: 'text-primary dark:text-primary-light', dot: 'bg-primary', label: 'Upcoming' },
  active: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Active' },
  completed: { bg: 'bg-slate-100 dark:bg-slate-700/60', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', label: 'Completed' },
  draft: { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', label: 'Draft' },
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

  useEffect(() => { if (apiTrips?.length) setTripsState(apiTrips); }, [apiTrips]);

  const trips = tab === 'all' ? tripsState : tripsState.filter((t) => t.status === tab);
  const duplicateTrip = (trip) => setTripsState((current) => [{ ...trip, id: Date.now(), title: `${trip.title} Copy`, status: 'draft' }, ...current]);
  const deleteTrip = (id) => setTripsState((current) => current.filter((trip) => trip.id !== id));

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
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">My Trips</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{tripsState.length} total saved itineraries</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/create-trip')}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent px-4 py-2.5 text-xs font-bold text-white transition-all hover:scale-105 active:scale-[0.98] shadow-md"
        >
          <Plane size={14} /> New Trip
        </button>
      </div>

      {/* Status Tabs */}
      <div className="no-scrollbar flex snap-x gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`min-h-9 snap-start px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              tab === t.key
                ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {t.label}{' '}
            {t.key !== 'all' && (
              <span className="ml-1 opacity-70">({tripsState.filter((tr) => tr.status === t.key).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {trips.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-20 text-center">
          <FolderOpen size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">No trips found</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
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
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-hover hover:border-primary/40 dark:hover:border-primary/50"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Trip Image */}
                <div className="sm:w-56 h-48 sm:h-auto relative overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-3 py-1 backdrop-blur-md ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                    </span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="flex-1 p-5">
                  <h3 className="font-poppins text-base font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                    {trip.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar size={13} />{trip.startDate} – {trip.endDate}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin size={13} />{trip.destinations.length} cities
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <RouteIcon size={13} />{trip.distance}
                    </span>
                  </div>

                  {/* Destination tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {trip.destinations.map((d, j) => (
                      <span key={j} className="text-[10px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full px-2.5 py-1">{d}</span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-auto pt-2">
                    <div className="flex flex-wrap gap-4">
                      <span className="text-sm font-extrabold text-primary dark:text-primary-light flex items-center gap-0.5">
                        <DollarSign size={15} />${trip.totalBudget.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <Clock size={13} />{trip.activities} activities
                      </span>
                    </div>
                    <span className="text-primary dark:text-primary-light text-xs font-bold flex items-center gap-0.5 group-hover:underline">
                      View Details <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-700/80 pt-3">
                    {[
                      { label: trip.status === 'draft' ? 'Continue draft' : 'Edit', icon: Edit3, action: () => navigate('/create-trip') },
                      { label: 'Duplicate', icon: Copy, action: () => duplicateTrip(trip) },
                      { label: 'Share', icon: Share2, action: () => setShareTrip(trip) },
                      { label: 'Delete', icon: Trash2, action: () => deleteTrip(trip.id), danger: true },
                    ].map((action) => (
                      <button
                        key={action.label}
                        onClick={(event) => { event.stopPropagation(); action.action(); }}
                        className={`flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-colors ${
                          action.danger
                            ? 'bg-danger/10 text-danger hover:bg-danger/20'
                            : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary-light'
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

      <ShareModal
        open={Boolean(shareTrip)}
        onClose={() => setShareTrip(null)}
        tripTitle={shareTrip?.title}
        tripUrl={shareTrip ? `${window.location.origin}/trip/${shareTrip.id}` : ''}
      />
    </AppLayout>
  );
}

