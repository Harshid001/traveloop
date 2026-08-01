import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Check, Shirt, Laptop, FileText, Heart, Pill, Package } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

const ICONS = { Clothes: Shirt, Electronics: Laptop, Documents: FileText, Toiletries: Package, 'Travel Essentials': Heart, 'Weather Based Items': Package, Medicines: Pill };
const COLORS = { Clothes: '#4F46E5', Electronics: '#7C3AED', Documents: '#F59E0B', Toiletries: '#06B6D4', 'Travel Essentials': '#22C55E', 'Weather Based Items': '#0EA5E9', Medicines: '#EF4444' };

const defaultItems = {
  Clothes: [],
  Electronics: [],
  Documents: [],
  Toiletries: [],
  'Travel Essentials': [],
  'Weather Based Items': [],
  Medicines: [],
};

export default function PackingScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState(defaultItems);
  const [newItem, setNewItem] = useState({});
  const categories = Object.keys(items);

  const toggle = (cat, i) => {
    setItems((p) => ({
      ...p,
      [cat]: p[cat].map((item, idx) => (idx === i ? { ...item, done: !item.done } : item)),
    }));
  };

  const remove = (cat, i) => {
    setItems((p) => ({ ...p, [cat]: p[cat].filter((_, idx) => idx !== i) }));
  };

  const add = (cat) => {
    if (!newItem[cat]?.trim()) return;
    setItems((p) => ({ ...p, [cat]: [...p[cat], { text: newItem[cat], done: false }] }));
    setNewItem((p) => ({ ...p, [cat]: '' }));
  };

  const totalItems = categories.reduce((s, c) => s + items[c].length, 0);
  const doneItems = categories.reduce((s, c) => s + items[c].filter((i) => i.done).length, 0);
  const overallPct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Packing Checklist</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{doneItems}/{totalItems} items packed ({overallPct}%)</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-extrabold text-primary dark:text-primary-light">{overallPct}% Packed</span>
          <div className="w-28 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div animate={{ width: `${overallPct}%` }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent" transition={{ duration: 0.5 }} />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {categories.map((cat, ci) => {
          const catDone = items[cat].filter((i) => i.done).length;
          const catPct = items[cat].length ? Math.round((catDone / items[cat].length) * 100) : 0;
          const Icon = ICONS[cat] || Package;
          const color = COLORS[cat] || '#4F46E5';

          return (
            <motion.div key={cat} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-700/80">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18' }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100 flex-1">{cat}</span>
                <span className="text-xs font-bold" style={{ color }}>{catPct}%</span>
                <div className="w-16 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <motion.div animate={{ width: `${catPct}%` }} className="h-full rounded-full" style={{ backgroundColor: color }} transition={{ duration: 0.5 }} />
                </div>
              </div>

              <div className="p-3 space-y-1">
                <AnimatePresence>
                  {items[cat].map((item, i) => (
                    <motion.div key={item.text + i} exit={{ opacity: 0, x: -20 }} layout
                      className="flex items-center gap-3 py-2 px-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <button aria-label={`${item.done ? 'Mark unpacked' : 'Mark packed'}: ${item.text}`} onClick={() => toggle(cat, i)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                          item.done ? 'border-transparent' : 'border-slate-300 dark:border-slate-600 hover:border-primary'
                        }`} style={item.done ? { backgroundColor: color } : {}}>
                        {item.done && <Check size={13} className="text-white" />}
                      </button>
                      <span className={`text-xs font-medium flex-1 ${item.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{item.text}</span>
                      <button aria-label={`Remove ${item.text}`} onClick={() => remove(cat, i)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-danger hover:bg-danger/10 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="flex gap-2 pt-2">
                  <input value={newItem[cat] || ''} onChange={(e) => setNewItem((p) => ({ ...p, [cat]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && add(cat)}
                    placeholder={`Add ${cat.toLowerCase()} item...`}
                    className="input-field text-xs py-2 px-3" />
                  <button aria-label={`Add ${cat.toLowerCase()} item`} onClick={() => add(cat)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all shadow-md hover:scale-105 active:scale-95 shrink-0" style={{ backgroundColor: color }}>
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
}

