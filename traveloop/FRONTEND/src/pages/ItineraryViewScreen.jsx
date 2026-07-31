import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Clock, Star, DollarSign, Globe,
  Plane, Share2, PenLine, Printer,
} from 'lucide-react';
import Button from '../components/ui/Button';
import AppLayout from '../components/layout/AppLayout';

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
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <button aria-label="Go back" onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Itinerary Preview</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete day-by-day travel roadmap</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button aria-label="Print itinerary" onClick={() => window.print()} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"><Printer size={16} /></button>
          <Button variant="primary" onClick={() => navigate('/itinerary-builder')} className="text-xs px-4 py-2 font-bold shadow-md">
            <PenLine size={14} /> Edit Itinerary
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl border border-slate-700/60"
      >
        <h2 className="break-words font-poppins text-2xl sm:text-3xl font-extrabold mb-1">{itinerary.name}</h2>
        <p className="text-indigo-200 text-xs sm:text-sm mb-6">Your curated Traveloop AI itinerary</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center">
            <Clock size={20} className="mx-auto mb-1 text-indigo-300" />
            <p className="font-poppins text-2xl font-extrabold">{itinerary.totalDays}</p>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Days</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center">
            <MapPin size={20} className="mx-auto mb-1 text-accent" />
            <p className="font-poppins text-2xl font-extrabold">{itinerary.destinations}</p>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Cities</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center">
            <DollarSign size={20} className="mx-auto mb-1 text-emerald-400" />
            <p className="break-words font-poppins text-xl font-extrabold">{itinerary.totalBudget}</p>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Est. Budget</p>
          </div>
        </div>
      </motion.div>

      {/* Route Overview */}
      <div className="no-scrollbar flex snap-x items-center gap-2 mb-8 overflow-x-auto pb-2">
        {itinerary.stops.map((s, i) => (
          <div key={i} className="flex shrink-0 snap-start items-center gap-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 px-4 py-2.5 shadow-soft">
              <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{s.city}</p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{s.dates}</p>
            </div>
            {i < itinerary.stops.length - 1 && (
              <div className="flex items-center gap-1 text-slate-300 dark:text-slate-600">
                <div className="w-6 h-px bg-slate-200 dark:bg-slate-700" />
                <Plane size={14} className="text-primary" />
                <div className="w-6 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

        {itinerary.stops.map((stop, si) => (
          <div key={si} className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pl-14 mb-4"
            >
              <div className="absolute left-3 top-1 w-5 h-5 rounded-full bg-primary border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center">
                <MapPin size={8} className="text-white" />
              </div>
              <div>
                <h3 className="font-poppins text-lg font-extrabold text-slate-900 dark:text-slate-100">{stop.city}, {stop.country}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium"><Calendar size={12} /> {stop.dates}</p>
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
                <div className="absolute left-[18px] top-4 w-2.5 h-2.5 rounded-full bg-primary/20 border-2 border-primary" />
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-soft hover:shadow-hover transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                      <day.icon size={16} className="text-primary dark:text-primary-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 rounded-md px-2 py-0.5">Day {day.day}</span>
                        <h4 className="min-w-0 text-sm font-bold text-slate-900 dark:text-slate-100 sm:truncate">{day.label}</h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{day.desc}</p>
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
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-soft mt-4 mb-8"
      >
        <h3 className="font-poppins text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Budget Breakdown Summary</h3>
        <div className="space-y-3">
          {budgetSplit.map((b, i) => (
            <div key={i} className="grid grid-cols-[5rem_1fr] items-center gap-2 sm:flex sm:gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-20 shrink-0">{b.label}</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${b.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                />
              </div>
              <span className="col-span-2 text-right text-xs font-extrabold text-slate-900 dark:text-slate-100 sm:col-span-1 sm:w-24 sm:shrink-0">{b.amount}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pb-8 print:hidden sm:flex-row">
        <Button variant="secondary" onClick={() => navigate('/itinerary-builder')} className="flex-1 py-3 text-xs font-bold">
          <PenLine size={14} /> Edit Itinerary
        </Button>
        <Button
          variant="primary"
          className="flex-1 py-3 text-xs font-bold shadow-lg"
          onClick={async () => {
            try {
              const shareUrl = `${window.location.origin}/public-trip/${itinerary.shareId || ''}`;
              if (navigator.share) {
                await navigator.share({ title: itinerary.name, url: shareUrl });
              } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Share link copied to clipboard');
              }
            } catch (e) {
              console.error('Share failed', e);
            }
          }}
        >
          <Share2 size={14} /> Share Itinerary
        </Button>
      </div>
    </AppLayout>
  );
}

