import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, PenLine, MapPin, Clock, Save, X, StickyNote } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

const COLORS = ['#4F46E5', '#22C55E', '#F59E0B', '#7C3AED', '#EF4444', '#06B6D4'];

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
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Trip Journal &amp; Notes</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{notes.length} saved notes</p>
          </div>
        </div>
        <button
          aria-label="Add note"
          onClick={startNew}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent px-4 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={15} /> Add Note
        </button>
      </div>

      {/* Edit / Add note panel */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            className="mb-6 rounded-2xl border border-primary/30 bg-white dark:bg-slate-800 p-5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100">
                {editing === 'new' ? '✨ Create New Note' : '✏️ Edit Note'}
              </h3>
              <button
                aria-label="Close note editor"
                onClick={() => setEditing(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Note title"
                className="input-field text-xs py-2.5 font-semibold"
              />
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your note contents..."
                rows={4}
                className="input-field text-xs py-2.5 resize-none"
              />
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.trip}
                  onChange={(e) => setForm({ ...form, trip: e.target.value })}
                  placeholder="Link to destination (e.g. Paris)"
                  className="input-field text-xs py-2.5 pl-10"
                />
              </div>
              <button
                onClick={saveNote}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent py-3 text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Save size={14} /> Save Note
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-20 text-center">
          <StickyNote size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">No notes yet</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Start journaling your travel memories!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover hover:border-primary/40 dark:hover:border-primary/50"
            >
              {/* Color accent bar */}
              <div className="h-1.5" style={{ backgroundColor: COLORS[note.color % COLORS.length] }} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{note.title}</h4>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      aria-label={`Edit ${note.title}`}
                      onClick={() => startEdit(note)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-primary transition-colors"
                    >
                      <PenLine size={12} />
                    </button>
                    <button
                      aria-label={`Delete ${note.title}`}
                      onClick={() => deleteNote(note.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-danger transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-4 font-normal">{note.content}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700/60 pt-3">
                  <span
                    className="text-[10px] font-bold rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: COLORS[note.color % COLORS.length] + '18', color: COLORS[note.color % COLORS.length] }}
                  >
                    {note.trip}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                    <Clock size={10} />{note.ts}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

