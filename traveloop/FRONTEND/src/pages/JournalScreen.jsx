import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, PenLine, MapPin, Clock, Save, X, StickyNote } from 'lucide-react';

const COLORS = ['#4F46E5', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444', '#3B82F6'];

const defaultNotes = [
  { id: 1, title: 'Hotel Check-in', content: 'Hotel Lumière, Paris\nCheck-in: 2 PM, Room 412\nConfirmation: #PAR29847', trip: 'Paris', ts: '2026-06-28 10:30', color: 0 },
  { id: 2, title: 'Local Contact', content: 'Guide Marco: +39 338 123 4567\nMeeting point: Piazza Navona, 9 AM', trip: 'Rome', ts: '2026-06-29 14:15', color: 1 },
  { id: 3, title: 'Flight Details', content: 'Air France AF1234\nDeparture: Jul 1, 6:30 AM\nTerminal 2E, Gate B42', trip: 'Paris', ts: '2026-06-30 09:00', color: 2 },
  { id: 4, title: 'Packing Reminder', content: "Don't forget universal adapter and sunscreen! Also bring the printed visa copies.", trip: 'General', ts: '2026-06-30 20:00', color: 3 },
  { id: 5, title: 'Restaurant Reservation', content: 'La Pepita Tapas Bar\nJul 8, 8:30 PM\nBooking under: Patel, 4 guests', trip: 'Barcelona', ts: '2026-07-01 11:00', color: 4 },
];

export default function JournalScreen() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(defaultNotes);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', trip: '' });

  const startNew = () => {
    setForm({ title: '', content: '', trip: '' });
    setEditing('new');
  };

  const startEdit = (note) => {
    setForm({ title: note.title, content: note.content, trip: note.trip });
    setEditing(note.id);
  };

  const saveNote = () => {
    if (!form.title.trim()) return;
    if (editing === 'new') {
      setNotes((p) => [{ id: Date.now(), ...form, ts: new Date().toISOString().slice(0, 16).replace('T', ' '), color: Math.floor(Math.random() * COLORS.length) }, ...p]);
    } else {
      setNotes((p) => p.map((n) => (n.id === editing ? { ...n, ...form } : n)));
    }
    setEditing(null);
  };

  const deleteNote = (id) => setNotes((p) => p.filter((n) => n.id !== id));

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-indigo-400 dark:focus:bg-slate-800';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label="Back to home"
              onClick={() => navigate('/home')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-poppins text-lg font-bold text-slate-900 dark:text-white">Trip Journal</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{notes.length} notes</p>
            </div>
          </div>
          <button
            aria-label="Add note"
            onClick={startNew}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Edit / Add note panel */}
        <AnimatePresence>
          {editing !== null && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-md dark:border-indigo-900/40 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-poppins text-sm font-bold text-slate-900 dark:text-white">
                  {editing === 'new' ? '✨ New Note' : '✏️ Edit Note'}
                </h3>
                <button
                  aria-label="Close note editor"
                  onClick={() => setEditing(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Note title"
                  className={inputCls}
                />
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your note..."
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    value={form.trip}
                    onChange={(e) => setForm({ ...form, trip: e.target.value })}
                    placeholder="Link to destination (e.g. Paris)"
                    className={`${inputCls} pl-10 text-xs`}
                  />
                </div>
                <button
                  onClick={saveNote}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-[0.98]"
                >
                  <Save size={14} /> Save Note
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <StickyNote size={40} className="mx-auto text-slate-300 mb-4 dark:text-slate-600" />
            <p className="font-poppins text-lg font-bold text-slate-700 dark:text-slate-300">No notes yet</p>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">Start journaling your travel memories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800"
              >
                {/* Color accent bar */}
                <div className="h-1.5" style={{ backgroundColor: COLORS[note.color % COLORS.length] }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-poppins text-sm font-bold text-slate-900 leading-snug dark:text-white">{note.title}</h4>
                    <div className="flex gap-1 opacity-100 transition-opacity shrink-0 sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        aria-label={`Edit ${note.title}`}
                        onClick={() => startEdit(note)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                      >
                        <PenLine size={12} />
                      </button>
                      <button
                        aria-label={`Delete ${note.title}`}
                        onClick={() => deleteNote(note.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-700 dark:text-slate-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line mb-3 dark:text-slate-400">{note.content}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="text-[10px] font-semibold rounded-full px-2.5 py-0.5"
                      style={{ backgroundColor: COLORS[note.color % COLORS.length] + '15', color: COLORS[note.color % COLORS.length] }}
                    >
                      {note.trip}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 dark:text-slate-500">
                      <Clock size={9} />{note.ts}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
