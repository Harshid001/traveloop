import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, CheckCheck, Clock, PackageCheck, Trash2, WalletCards } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

const initialNotifications = [
  { id: 1, type: 'trip', title: 'Europe Explorer starts soon', message: 'Review your itinerary and hotel notes before departure.', time: 'Today', read: false, icon: Clock },
  { id: 2, type: 'packing', title: 'Packing reminder', message: 'Passport, charger, and medicine checklist still has unpacked items.', time: 'Yesterday', read: false, icon: PackageCheck },
  { id: 3, type: 'budget', title: 'Budget alert', message: 'Food expenses are at 82 percent of your planned category budget.', time: 'May 20', read: true, icon: WalletCards },
  { id: 4, type: 'saved', title: 'Saved trip update', message: 'Tokyo spring hotel placeholders are ready to connect to inventory.', time: 'May 18', read: true, icon: Bell },
];

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialNotifications);
  const unread = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const markRead = (id) => setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  const clearAll = () => setItems([]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button aria-label="Back to dashboard" onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Notifications &amp; Alerts</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{unread} unread reminders</p>
          </div>
        </div>
        <button onClick={clearAll} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-danger transition-colors" aria-label="Clear notifications">
          <Trash2 size={16} /> Clear all
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-6 py-16 text-center">
            <Bell size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">All clear!</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Trip reminders, budget alerts, and packing nudges will appear here.</p>
          </div>
        ) : (
          items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`flex gap-4 rounded-2xl border p-4 shadow-soft transition-all ${
                  item.read
                    ? 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800'
                    : 'border-primary/30 dark:border-primary/40 bg-primary/5 dark:bg-primary/10'
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 text-primary shadow-sm">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h2>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.message}</p>
                  <p className="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">{item.time}</p>
                </div>
                <button onClick={() => markRead(item.id)} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-primary transition-colors" aria-label={`Mark ${item.title} as read`}>
                  <CheckCheck size={16} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}

