import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, PenLine, MapPin, Clock, Save, X, StickyNote } from 'lucide-react';

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#4F46E5', '#EF4444', '#3B82F6'];

const defaultNotes = [
  { id: 1, title: 'Hotel Check-in', content: 'Hotel Lumière, Paris\nCheck-in: 2 PM, Room 412\nConfirmation: #PAR29847', trip: 'Paris', ts: '2026-06-28 10:30', color: 0 },
  { id: 2, title: 'Local Contact', content: 'Guide Marco: +39 338 123 4567\nMeeting point: Piazza Navona, 9 AM', trip: 'Rome', ts: '2026-06-29 14:15', color: 1 },
  { id: 3, title: 'Flight Details', content: 'Air France AF1234\nDeparture: Jul 1, 6:30 AM\nTerminal 2E, Gate B42', trip: 'Paris', ts: '2026-06-30 09:00', color: 2 },
  { id: 4, title: 'Packing Reminder', content: 'Don\'t forget universal adapter and sunscreen! Also bring the printed visa copies.', trip: 'General', ts: '2026-06-30 20:00', color: 3 },
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
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"><ArrowLeft size={18} /></button>
            <div>
              <h1 className="font-poppins text-lg font-bold text-textDark">Trip Journal</h1>
              <p className="text-xs text-textMuted">{notes.length} notes</p>
            </div>
          </div>
          <button aria-label="Add note" onClick={startNew}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm">
            <Plus size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Edit/Add Card */}
        <AnimatePresence>
          {editing !== null && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-hover p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-poppins text-sm font-bold text-textDark">{editing === 'new' ? 'New Note' : 'Edit Note'}</h3>
                <button aria-label="Close note editor" onClick={() => setEditing(null)} className="tap-target rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Note title" className="input-field text-sm py-3 pl-4" />
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your note..." rows={4}
                  className="w-full bg-surface-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-textDark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.trip} onChange={(e) => setForm({ ...form, trip: e.target.value })}
                    placeholder="Link to destination (e.g. Paris)" className="input-field text-xs py-2.5 pl-10" />
                </div>
                <button onClick={saveNote}
                  className="w-full bg-primary text-white text-sm font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-sm">
                  <Save size={14} /> Save Note
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-20">
            <StickyNote size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-textMuted text-sm">No notes yet. Start journaling!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note, i) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden card-hover group">
                <div className="h-1" style={{ backgroundColor: COLORS[note.color % COLORS.length] }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-poppins text-sm font-bold text-textDark leading-snug">{note.title}</h4>
                    <div className="flex gap-1 opacity-100 transition-opacity shrink-0 sm:opacity-0 sm:group-hover:opacity-100">
                      <button aria-label={`Edit ${note.title}`} onClick={() => startEdit(note)} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                        <PenLine size={12} />
                      </button>
                      <button aria-label={`Delete ${note.title}`} onClick={() => deleteNote(note.id)} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-danger transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line mb-3">{note.content}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold rounded-full px-2.5 py-0.5"
                      style={{ backgroundColor: COLORS[note.color % COLORS.length] + '12', color: COLORS[note.color % COLORS.length] }}>
                      {note.trip}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={9} />{note.ts}</span>
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
