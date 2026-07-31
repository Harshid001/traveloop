import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, MapPin, Calendar,
  FileText, Eye, Send, GripVertical,
} from 'lucide-react';
import Button from '../components/ui/Button';

const EMPTY_STOP = { city: '', country: '', startDate: '', endDate: '', activities: [''], notes: '' };

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-indigo-400';

export default function ItineraryBuilderScreen() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('European Adventure');
  const [stops, setStops] = useState([
    { city: 'Paris', country: 'France', startDate: '2026-07-01', endDate: '2026-07-03', activities: ['Eiffel Tower', 'Louvre Museum', 'Seine Cruise'], notes: 'Book skip-the-line tickets' },
    { city: 'Rome', country: 'Italy', startDate: '2026-07-04', endDate: '2026-07-06', activities: ['Colosseum', 'Vatican City', 'Trevi Fountain'], notes: 'Try authentic pasta near Trastevere' },
    { city: 'Barcelona', country: 'Spain', startDate: '2026-07-07', endDate: '2026-07-09', activities: ['Sagrada Familia', 'Park Güell', 'La Rambla Walk'], notes: '' },
  ]);

  const addStop = () => setStops((p) => [...p, { ...EMPTY_STOP, activities: [''] }]);
  const removeStop = (i) => setStops((p) => p.filter((_, idx) => idx !== i));

  const updateStop = (i, field, val) => {
    setStops((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  const moveStop = (i, dir) => {
    const next = i + dir;
    if (next < 0 || next >= stops.length) return;
    setStops((p) => {
      const arr = [...p];
      [arr[i], arr[next]] = [arr[next], arr[i]];
      return arr;
    });
  };

  const addActivity = (si) => {
    setStops((p) => p.map((s, i) => (i === si ? { ...s, activities: [...s.activities, ''] } : s)));
  };
  const removeActivity = (si, ai) => {
    setStops((p) => p.map((s, i) => (i === si ? { ...s, activities: s.activities.filter((_, j) => j !== ai) } : s)));
  };
  const updateActivity = (si, ai, val) => {
    setStops((p) => p.map((s, i) => (i === si ? { ...s, activities: s.activities.map((a, j) => (j === ai ? val : a)) } : s)));
  };

  const getDays = (stop) => {
    if (!stop.startDate || !stop.endDate) return [];
    const start = new Date(stop.startDate);
    const end = new Date(stop.endDate);
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const totalDays = stops.reduce((sum, s) => sum + Math.max(getDays(s).length, 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label="Back to home"
              onClick={() => navigate('/home')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-poppins text-lg font-bold text-slate-900 dark:text-white">Itinerary Builder</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stops.length} stops · {totalDays} days</p>
            </div>
          </div>
          <Button variant="primary" onClick={() => navigate('/itinerary-view')} className="text-xs px-5 py-2.5">
            <Eye size={14} /> Preview
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Name */}
        <div className="mb-8">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block dark:text-slate-500">Trip Name</label>
          <input
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-poppins text-lg font-bold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400"
          />
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-indigo-200/60 hidden sm:block dark:bg-indigo-800/40" />

          <AnimatePresence>
            {stops.map((stop, si) => (
              <motion.div
                key={si}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: si * 0.05 }}
                className="relative mb-6 sm:pl-16"
              >
                {/* Timeline dot */}
                <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-md z-10 hidden sm:flex items-center justify-center dark:border-slate-900">
                  <span className="text-[8px] font-bold text-white">{si + 1}</span>
                </div>

                {/* Stop Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700/60">
                  {/* Stop Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-white p-4 flex items-center gap-3 border-b border-slate-100 dark:from-indigo-900/20 dark:to-slate-800 dark:border-slate-700/60">
                    <div className="flex flex-col gap-0.5">
                      <button
                        aria-label={`Move stop ${si + 1} up`}
                        onClick={() => moveStop(si, -1)}
                        disabled={si === 0}
                        className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:text-indigo-500 disabled:opacity-30 dark:text-slate-600 dark:hover:text-indigo-400"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        aria-label={`Move stop ${si + 1} down`}
                        onClick={() => moveStop(si, 1)}
                        disabled={si === stops.length - 1}
                        className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:text-indigo-500 disabled:opacity-30 dark:text-slate-600 dark:hover:text-indigo-400"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <GripVertical size={16} className="text-slate-300 dark:text-slate-600" />
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-0.5 dark:bg-indigo-900/40 dark:text-indigo-400">
                      Stop {si + 1}
                    </span>
                    <span className="text-sm font-poppins font-bold text-slate-800 flex-1 truncate dark:text-white">
                      {stop.city || 'New Stop'}{stop.country ? `, ${stop.country}` : ''}
                    </span>
                    {stops.length > 1 && (
                      <button
                        aria-label={`Remove stop ${si + 1}`}
                        onClick={() => removeStop(si)}
                        className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Stop Body */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input value={stop.city} onChange={(e) => updateStop(si, 'city', e.target.value)} placeholder="City" className={`${inputCls} pl-10`} />
                      </div>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input value={stop.country} onChange={(e) => updateStop(si, 'country', e.target.value)} placeholder="Country" className={`${inputCls} pl-10`} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input type="date" value={stop.startDate} onChange={(e) => updateStop(si, 'startDate', e.target.value)} className={`${inputCls} pl-10`} />
                      </div>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input type="date" value={stop.endDate} onChange={(e) => updateStop(si, 'endDate', e.target.value)} className={`${inputCls} pl-10`} />
                      </div>
                    </div>

                    {/* Activities */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider dark:text-slate-500">Activities</span>
                        <button
                          onClick={() => addActivity(si)}
                          className="flex min-h-8 items-center gap-0.5 rounded-lg px-2 text-[10px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                        >
                          <Plus size={11} /> Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {stop.activities.map((a, ai) => (
                          <div key={ai} className="flex min-h-9 min-w-[8.75rem] max-w-full items-center gap-1 bg-indigo-50 rounded-full pl-3 pr-1.5 py-1.5 dark:bg-indigo-900/30">
                            <input
                              value={a}
                              onChange={(e) => updateActivity(si, ai, e.target.value)}
                              placeholder="Activity"
                              className="w-full min-w-0 bg-transparent text-xs text-slate-800 outline-none dark:text-slate-200"
                            />
                            {stop.activities.length > 1 && (
                              <button
                                aria-label="Remove activity"
                                onClick={() => removeActivity(si, ai)}
                                className="flex min-h-7 min-w-7 items-center justify-center rounded-full text-slate-300 transition-colors hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="relative">
                      <FileText size={14} className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                      <textarea
                        value={stop.notes}
                        onChange={(e) => updateStop(si, 'notes', e.target.value)}
                        placeholder="Notes & reminders..."
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-4 text-xs text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
                      />
                    </div>

                    {/* Day-wise Plan */}
                    {getDays(stop).length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-700/60">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block dark:text-slate-500">Day-wise Plan</span>
                        <div className="space-y-1.5">
                          {getDays(stop).map((day, di) => (
                            <div key={di} className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded-md px-2 py-0.5 w-14 text-center shrink-0 dark:bg-indigo-900/30 dark:text-indigo-400">
                                Day {di + 1}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                              <span className="w-full text-xs text-slate-400 sm:ml-auto sm:w-auto dark:text-slate-500">
                                {di === 0 ? `Arrive in ${stop.city}` : di === getDays(stop).length - 1 ? 'Departure' : stop.activities[di - 1] || 'Free day'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Travel connector */}
                {si < stops.length - 1 && (
                  <div className="flex items-center justify-center py-2 sm:ml-[-2.5rem]">
                    <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <Send size={12} className="rotate-90" />
                      <span>Travel to next stop</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Stop */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={addStop}
          className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-5 flex items-center justify-center gap-2 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors mt-4 dark:border-slate-700 dark:text-slate-500 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
        >
          <Plus size={18} /> Add Stop
        </motion.button>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-3 mt-8 pb-8 sm:flex-row">
          <Button variant="secondary" onClick={() => navigate('/home')} className="flex-1 py-3.5 text-xs">
            Save Draft
          </Button>
          <Button variant="primary" onClick={() => navigate('/itinerary-view')} className="flex-1 py-3.5 text-xs">
            <Eye size={14} /> Preview Itinerary
          </Button>
        </div>
      </main>
    </div>
  );
}
