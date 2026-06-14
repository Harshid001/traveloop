import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, DollarSign, Plane, Clock, ChevronRight, Route as RouteIcon, Copy, Edit3, Share2, Trash2 } from 'lucide-react';
import { demoMyTrips } from '../data/trips';
import MobileBottomNav from '../components/common/MobileBottomNav';
import ShareModal from '../components/common/ShareModal';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'draft', label: 'Drafts' },
];

const STATUS_STYLES = {
  upcoming: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary', label: 'Upcoming' },
  active: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success', label: 'Active' },
  completed: { bg: 'bg-slate-100', text: 'text-textMuted', dot: 'bg-slate-400', label: 'Completed' },
  draft: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning', label: 'Draft' },
};

export default function MyTripsScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [tripsState, setTripsState] = useState([
    ...demoMyTrips,
    { id: 104, title: 'Japan Spring Draft', status: 'draft', startDate: 'Apr 5, 2027', endDate: 'Apr 14, 2027', destinations: ['Tokyo', 'Kyoto'], totalBudget: 6400, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80', activities: 4, distance: '520 km' },
  ]);
  const [shareTrip, setShareTrip] = useState(null);

  const trips = tab === 'all' ? tripsState : tripsState.filter((t) => t.status === tab);
  const duplicateTrip = (trip) => setTripsState((current) => [{ ...trip, id: Date.now(), title: `${trip.title} Copy`, status: 'draft' }, ...current]);
  const deleteTrip = (id) => setTripsState((current) => current.filter((trip) => trip.id !== id));

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"><ArrowLeft size={18} /></button>
          <div className="flex-1">
            <h1 className="font-poppins text-lg font-bold text-textDark">My Trips</h1>
            <p className="text-xs text-textMuted">{tripsState.length} trips total</p>
          </div>
          <button onClick={() => navigate('/create-trip')}
            className="min-h-10 bg-primary text-white text-xs font-semibold rounded-xl px-4 py-2.5 hover:bg-primary-dark active:scale-97 transition-all duration-200 flex items-center gap-1.5 shadow-sm">
            <Plane size={13} /> New Trip
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
        {/* Tabs */}
        <div className="no-scrollbar flex snap-x gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`min-h-10 snap-start px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                tab === t.key ? 'bg-primary text-white shadow-sm' : 'bg-white text-textMuted border border-slate-200 hover:bg-slate-50'
              }`}>
              {t.label} {t.key !== 'all' && <span className="ml-1 opacity-60">({tripsState.filter((tr) => tr.status === t.key).length})</span>}
            </button>
          ))}
        </div>

        {/* Trip Cards */}
        <div className="space-y-4">
          {trips.map((trip, i) => {
            const st = STATUS_STYLES[trip.status];
            return (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden card-hover cursor-pointer group">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-64 h-48 sm:h-auto relative overflow-hidden shrink-0">
                    <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-1 ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-4 sm:p-5">
                    <h3 className="font-poppins text-base font-bold text-textDark mb-1 group-hover:text-primary transition-colors">{trip.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className="text-xs text-textMuted flex items-center gap-1"><Calendar size={12} />{trip.startDate} – {trip.endDate}</span>
                      <span className="text-xs text-textMuted flex items-center gap-1"><MapPin size={12} />{trip.destinations.length} cities</span>
                      <span className="text-xs text-textMuted flex items-center gap-1"><RouteIcon size={12} />{trip.distance}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {trip.destinations.map((d, j) => (
                        <span key={j} className="text-[10px] font-medium bg-primary/8 text-primary rounded-full px-2.5 py-1">{d}</span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-auto pt-2">
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        <span className="text-sm font-bold text-primary flex items-center gap-1">
                          <DollarSign size={14} />${trip.totalBudget.toLocaleString()}
                        </span>
                        <span className="text-xs text-textMuted flex items-center gap-1">
                          <Clock size={12} />{trip.activities} activities
                        </span>
                      </div>
                      <span className="text-primary text-xs font-semibold flex items-center gap-0.5 group-hover:underline">
                        View Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      {[
                        { label: trip.status === 'draft' ? 'Continue draft' : 'Edit', icon: Edit3, action: () => navigate('/create-trip') },
                        { label: 'Duplicate', icon: Copy, action: () => duplicateTrip(trip) },
                        { label: 'Share', icon: Share2, action: () => setShareTrip(trip) },
                        { label: 'Delete', icon: Trash2, action: () => deleteTrip(trip.id), danger: true },
                      ].map((action) => (
                        <button
                          key={action.label}
                          onClick={(event) => {
                            event.stopPropagation();
                            action.action();
                          }}
                          className={`min-h-10 rounded-xl px-3 text-xs font-semibold transition-colors ${action.danger ? 'bg-danger/10 text-danger hover:bg-danger/15' : 'bg-slate-50 text-textMuted hover:bg-primary/5 hover:text-primary'}`}
                        >
                          <action.icon size={13} className="mr-1 inline" /> {action.label}
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
      <ShareModal open={Boolean(shareTrip)} onClose={() => setShareTrip(null)} tripTitle={shareTrip?.title} tripUrl={shareTrip ? `${window.location.origin}/trip/${shareTrip.id}` : ''} />
    </div>
  );
}
