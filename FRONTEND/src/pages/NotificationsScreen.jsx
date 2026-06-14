import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, CheckCheck, Clock, PackageCheck, Trash2, WalletCards } from 'lucide-react';
import MobileBottomNav from '../components/common/MobileBottomNav';

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
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button aria-label="Back to dashboard" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="font-poppins text-lg font-bold text-textDark">Notifications</h1>
            <p className="text-xs text-textMuted">{unread} unread reminders and alerts</p>
          </div>
          <button onClick={clearAll} className="tap-target rounded-xl text-slate-400 hover:bg-slate-50 hover:text-danger" aria-label="Clear notifications">
            <Trash2 size={17} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <Bell size={38} className="mx-auto mb-4 text-slate-200" />
            <p className="font-poppins text-lg font-bold text-textDark">All clear</p>
            <p className="mt-2 text-sm text-textMuted">Trip reminders, budget alerts, and packing nudges will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`flex gap-4 rounded-3xl border p-4 shadow-soft ${item.read ? 'border-slate-100 bg-white' : 'border-primary/15 bg-primary/5'}`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-poppins text-sm font-bold text-textDark">{item.title}</h2>
                      {!item.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-textMuted">{item.message}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-400">{item.time}</p>
                  </div>
                  <button onClick={() => markRead(item.id)} className="tap-target rounded-xl text-slate-300 hover:bg-white hover:text-primary" aria-label={`Mark ${item.title} as read`}>
                    <CheckCheck size={17} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
}
