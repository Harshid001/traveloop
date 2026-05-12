import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, DollarSign, Plane, Clock, ChevronRight, Route as RouteIcon } from 'lucide-react';
import { demoMyTrips } from '../data/trips';
import MobileBottomNav from '../components/common/MobileBottomNav';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_STYLES = {
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', label: 'Upcoming' },
  active: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500', label: 'Active' },
  completed: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Completed' },
};

export default function MyTripsScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');

  const trips = tab === 'all' ? demoMyTrips : demoMyTrips.filter((t) => t.status === tab);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="font-poppins text-lg font-bold text-gray-900">My Trips</h1>
            <p className="text-xs text-gray-400">{demoMyTrips.length} trips total</p>
          </div>
          <button onClick={() => navigate('/create-trip')}
            className="min-h-11 bg-blue-600 text-white text-xs font-semibold rounded-full px-4 py-2.5 hover:bg-blue-700 active:scale-95 transition-all duration-300 flex items-center gap-1.5 shadow-sm hover:shadow-md">
            <Plane size={13} /> New Trip
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8">
        {/* Tabs */}
        <div className="no-scrollbar flex snap-x gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`min-h-11 snap-start px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                tab === t.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
              }`}>
              {t.label} {t.key !== 'all' && <span className="ml-1 opacity-60">({demoMyTrips.filter((tr) => tr.status === t.key).length})</span>}
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
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-64 h-48 sm:h-auto relative overflow-hidden shrink-0">
                    <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-1 ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 sm:p-5">
                    <h3 className="font-poppins text-base font-bold text-gray-900 mb-1">{trip.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} />{trip.startDate} – {trip.endDate}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={12} />{trip.destinations.length} cities</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><RouteIcon size={12} />{trip.distance}</span>
                    </div>

                    {/* Destination Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {trip.destinations.map((d, j) => (
                        <span key={j} className="text-[10px] font-medium bg-blue-50 text-blue-600 rounded-full px-2.5 py-1">{d}</span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-auto pt-2">
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
                          <DollarSign size={14} />${trip.totalBudget.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} />{trip.activities} activities
                        </span>
                      </div>
                      <span className="text-blue-600 text-xs font-semibold flex items-center gap-0.5 group-hover:underline">
                        View Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
