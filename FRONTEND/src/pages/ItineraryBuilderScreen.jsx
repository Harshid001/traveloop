import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, MapPin, Calendar,
  FileText, Eye, Send, GripVertical,
} from 'lucide-react';
import Button from '../components/common/Button';

const EMPTY_STOP = { city: '', country: '', startDate: '', endDate: '', activities: [''], notes: '' };

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
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"><ArrowLeft size={18} /></button>
            <div>
              <h1 className="font-poppins text-lg font-bold text-textDark">Itinerary Builder</h1>
              <p className="text-xs text-textMuted">{stops.length} stops · {totalDays} days</p>
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
          <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5 block">Trip Name</label>
          <input value={tripName} onChange={(e) => setTripName(e.target.value)}
            className="input-field text-lg font-poppins font-bold" />
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-primary/15 hidden sm:block" />

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
                <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-md z-10 hidden sm:flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{si + 1}</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden hover:shadow-hover transition-shadow">
                  {/* Stop Header */}
                  <div className="bg-gradient-to-r from-primary/5 to-white p-4 flex items-center gap-3 border-b border-slate-50">
                    <div className="flex flex-col gap-0.5">
                      <button aria-label={`Move stop ${si + 1} up`} onClick={() => moveStop(si, -1)} disabled={si === 0}
                        className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:text-primary disabled:opacity-30"><ChevronUp size={14} /></button>
                      <button aria-label={`Move stop ${si + 1} down`} onClick={() => moveStop(si, 1)} disabled={si === stops.length - 1}
                        className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:text-primary disabled:opacity-30"><ChevronDown size={14} /></button>
                    </div>
                    <GripVertical size={16} className="text-slate-300" />
                    <span className="text-xs font-bold text-primary bg-primary/8 rounded-full px-2.5 py-0.5">Stop {si + 1}</span>
                    <span className="text-sm font-poppins font-bold text-textDark flex-1 truncate">
                      {stop.city || 'New Stop'}{stop.country ? `, ${stop.country}` : ''}
                    </span>
                    {stops.length > 1 && (
                      <button aria-label={`Remove stop ${si + 1}`} onClick={() => removeStop(si)} className="w-9 h-9 rounded-full bg-danger/10 flex items-center justify-center text-danger hover:bg-danger/20 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Stop Body */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={stop.city} onChange={(e) => updateStop(si, 'city', e.target.value)}
                          placeholder="City" className="input-field text-xs py-2.5 pl-10" />
                      </div>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={stop.country} onChange={(e) => updateStop(si, 'country', e.target.value)}
                          placeholder="Country" className="input-field text-xs py-2.5 pl-10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="date" value={stop.startDate} onChange={(e) => updateStop(si, 'startDate', e.target.value)}
                          className="input-field text-xs py-2.5 pl-10" />
                      </div>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="date" value={stop.endDate} onChange={(e) => updateStop(si, 'endDate', e.target.value)}
                          className="input-field text-xs py-2.5 pl-10" />
                      </div>
                    </div>

                    {/* Activities */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Activities</span>
                        <button onClick={() => addActivity(si)} className="min-h-10 text-primary text-[10px] font-semibold flex items-center gap-0.5 hover:underline">
                          <Plus size={11} /> Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {stop.activities.map((a, ai) => (
                          <div key={ai} className="flex min-h-10 min-w-[8.75rem] max-w-full items-center gap-1 bg-primary/8 rounded-full pl-3 pr-1.5 py-1.5">
                            <input value={a} onChange={(e) => updateActivity(si, ai, e.target.value)}
                              placeholder="Activity" className="w-full min-w-0 bg-transparent text-xs text-textDark outline-none" />
                            {stop.activities.length > 1 && (
                              <button aria-label="Remove activity" onClick={() => removeActivity(si, ai)} className="flex min-h-8 min-w-8 items-center justify-center rounded-full text-slate-300 hover:text-danger transition-colors">
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="relative">
                      <FileText size={14} className="absolute left-3.5 top-3 text-slate-400" />
                      <textarea value={stop.notes} onChange={(e) => updateStop(si, 'notes', e.target.value)}
                        placeholder="Notes & reminders..." rows={2}
                        className="w-full bg-surface-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-xs text-textDark outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                    </div>

                    {/* Day-wise Plan */}
                    {getDays(stop).length > 0 && (
                      <div className="bg-surface-50 rounded-xl p-3 border border-slate-100">
                        <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-2 block">Day-wise Plan</span>
                        <div className="space-y-1.5">
                          {getDays(stop).map((day, di) => (
                            <div key={di} className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[10px] font-bold text-primary bg-primary/8 rounded-md px-2 py-0.5 w-14 text-center shrink-0">
                                Day {di + 1}
                              </span>
                              <span className="text-xs text-textMuted">{day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                              <span className="w-full text-xs text-slate-400 sm:ml-auto sm:w-auto">
                                {di === 0 ? `Arrive in ${stop.city}` : di === getDays(stop).length - 1 ? 'Departure' : stop.activities[di - 1] || 'Free day'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {si < stops.length - 1 && (
                  <div className="flex items-center justify-center py-2 sm:ml-[-2.5rem]">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Send size={12} className="text-primary rotate-90" />
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
          className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-5 flex items-center justify-center gap-2 text-textMuted hover:border-primary hover:text-primary transition-colors mt-4"
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
