import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Clock, Star, DollarSign, Globe,
  Plane, Share2, PenLine, Printer,
} from 'lucide-react';
import Button from '../components/common/Button';

const itinerary = {
  name: 'European Adventure',
  totalDays: 9,
  totalBudget: '₹3,50,000',
  destinations: 3,
  stops: [
    { city: 'Paris', country: 'France', dates: 'Jul 1 – Jul 3', days: [
      { day: 1, label: 'Arrival in Paris', desc: 'Check into hotel near Champs-Élysées, evening walk along Seine', icon: Plane },
      { day: 2, label: 'Eiffel Tower + Louvre', desc: 'Morning visit to Eiffel Tower, afternoon at Louvre Museum', icon: Star },
      { day: 3, label: 'Seine Cruise & Departure', desc: 'Morning cruise, afternoon travel to Rome', icon: Globe },
    ]},
    { city: 'Rome', country: 'Italy', dates: 'Jul 4 – Jul 6', days: [
      { day: 4, label: 'Arrive in Rome', desc: 'Settle in near Trastevere, explore local cuisine', icon: Plane },
      { day: 5, label: 'Colosseum + Vatican', desc: 'Full day heritage tour: Colosseum, Forum, Vatican City', icon: Star },
      { day: 6, label: 'Trevi Fountain & Depart', desc: 'Visit Trevi Fountain, Spanish Steps, train to Barcelona', icon: Globe },
    ]},
    { city: 'Barcelona', country: 'Spain', dates: 'Jul 7 – Jul 9', days: [
      { day: 7, label: 'Arrive in Barcelona', desc: 'Check in, walk along La Rambla, tapas dinner', icon: Plane },
      { day: 8, label: 'Sagrada Familia + Park Güell', desc: 'Gaudí masterpieces tour, beach evening', icon: Star },
      { day: 9, label: 'Final Day & Return', desc: 'Morning at Barceloneta Beach, airport transfer', icon: Globe },
    ]},
  ],
};

const budgetSplit = [
  { label: 'Hotels', amount: '₹1,20,000', pct: 34 },
  { label: 'Flights', amount: '₹95,000', pct: 27 },
  { label: 'Activities', amount: '₹55,000', pct: 16 },
  { label: 'Food', amount: '₹50,000', pct: 14 },
  { label: 'Transport', amount: '₹30,000', pct: 9 },
];

export default function ItineraryViewScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 print:bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Go back" onClick={() => navigate(-1)} className="tap-target rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"><ArrowLeft size={18} /></button>
            <h1 className="min-w-0 truncate font-poppins text-base font-bold text-textDark sm:text-lg">Itinerary Preview</h1>
          </div>
          <div className="flex gap-2">
            <button aria-label="Print itinerary" onClick={() => window.print()} className="tap-target rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"><Printer size={16} /></button>
            <Button variant="primary" onClick={() => navigate('/itinerary-builder')} className="px-3 py-2.5 text-xs sm:px-4">
              <PenLine size={14} /> <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 sm:p-8 text-white mb-8"
        >
          <h2 className="break-words font-poppins text-xl font-bold mb-1 sm:text-2xl lg:text-3xl">{itinerary.name}</h2>
          <p className="text-white/60 text-sm mb-6">Your complete travel plan</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <Clock size={18} className="mx-auto mb-1 text-white/70" />
              <p className="font-poppins text-xl font-bold">{itinerary.totalDays}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Days</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <MapPin size={18} className="mx-auto mb-1 text-white/70" />
              <p className="font-poppins text-xl font-bold">{itinerary.destinations}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Cities</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <DollarSign size={18} className="mx-auto mb-1 text-white/70" />
              <p className="break-words font-poppins text-lg font-bold">{itinerary.totalBudget}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Budget</p>
            </div>
          </div>
        </motion.div>

        {/* Route Overview */}
        <div className="no-scrollbar flex snap-x items-center gap-2 mb-8 overflow-x-auto pb-2">
          {itinerary.stops.map((s, i) => (
            <div key={i} className="flex shrink-0 snap-start items-center gap-2">
              <div className="bg-white rounded-xl border border-slate-100 px-4 py-2.5 shadow-soft">
                <p className="text-xs font-bold text-textDark">{s.city}</p>
                <p className="text-[10px] text-textMuted">{s.dates}</p>
              </div>
              {i < itinerary.stops.length - 1 && (
                <div className="flex items-center gap-1 text-slate-300">
                  <div className="w-6 h-px bg-slate-200" />
                  <Plane size={12} className="text-primary" />
                  <div className="w-6 h-px bg-slate-200" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-success" />

          {itinerary.stops.map((stop, si) => (
            <div key={si} className="mb-8">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative pl-14 mb-4"
              >
                <div className="absolute left-3 top-1 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-md flex items-center justify-center">
                  <MapPin size={8} className="text-white" />
                </div>
                <div>
                  <h3 className="font-poppins text-lg font-bold text-textDark">{stop.city}, {stop.country}</h3>
                  <p className="text-xs text-textMuted flex items-center gap-1"><Calendar size={11} /> {stop.dates}</p>
                </div>
              </motion.div>

              {stop.days.map((day, di) => (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: di * 0.05 }}
                  className="relative pl-14 mb-3"
                >
                  <div className="absolute left-[18px] top-4 w-2.5 h-2.5 rounded-full bg-primary/15 border-2 border-primary" />
                  <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-soft hover:shadow-hover transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                        <day.icon size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-primary bg-primary/8 rounded-md px-2 py-0.5">Day {day.day}</span>
                          <h4 className="min-w-0 text-sm font-semibold text-textDark sm:truncate">{day.label}</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{day.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Budget Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft mt-4 mb-8"
        >
          <h3 className="font-poppins text-base font-bold text-textDark mb-4">Budget Breakdown</h3>
          <div className="space-y-3">
            {budgetSplit.map((b, i) => (
              <div key={i} className="grid grid-cols-[5rem_1fr] items-center gap-2 sm:flex sm:gap-3">
                <span className="text-xs text-textMuted w-20 shrink-0">{b.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${b.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
                <span className="col-span-2 text-right text-xs font-semibold text-textDark sm:col-span-1 sm:w-20 sm:shrink-0">{b.amount}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-8 print:hidden sm:flex-row">
          <Button variant="secondary" onClick={() => navigate('/itinerary-builder')} className="flex-1 py-3.5 text-xs">
            <PenLine size={14} /> Edit
          </Button>
          <Button variant="primary" className="flex-1 py-3.5 text-xs">
            <Share2 size={14} /> Share Trip
          </Button>
        </div>
      </main>
    </div>
  );
}
