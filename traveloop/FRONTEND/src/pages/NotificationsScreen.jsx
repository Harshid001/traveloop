import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, CheckCheck, Clock, PackageCheck, Trash2, WalletCards } from 'lucide-react';
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '../services/apiSlice';
import AppLayout from '../components/layout/AppLayout';

const ICONS = {
  trip: Clock,
  packing: PackageCheck,
  budget: WalletCards,
  saved: Bell,
};

function iconFor(type) {
  return ICONS[type] || Bell;
}

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const { data: items = [], isLoading } = useGetNotificationsQuery();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [cleared, setCleared] = useState([]);
  const visible = (items || []).filter((item) => !cleared.includes(item.id));
  const unread = useMemo(() => visible.filter((item) => !item.read).length, [visible]);

  const markRead = (id) => {
    markNotificationRead(id);
  };

  const clearAll = () => setCleared((current) => [...current, ...visible.map((item) => item.id)]);

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
            <p className="text-xs text-slate-500 dark:text-slate-400">{isLoading ? 'Loading...' : `${unread} unread reminders`}</p>
          </div>
        </div>
        {visible.length > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-danger transition-colors" aria-label="Clear notifications">
            <Trash2 size={16} /> Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-6 py-16 text-center">
            <Bell size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">All clear!</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Trip reminders, budget alerts, and packing nudges will appear here.</p>
          </div>
        ) : (
          visible.map((item, index) => {
            const Icon = iconFor(item.type);
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
                  <p className="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">{item.time || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '')}</p>
                </div>
                {!item.read && (
                  <button onClick={() => markRead(item.id)} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-primary transition-colors" aria-label={`Mark ${item.title} as read`}>
                    <CheckCheck size={16} />
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
