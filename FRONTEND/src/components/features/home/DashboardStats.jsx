import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

/**
 * Displays the three animated statistic cards on the home dashboard.
 * Props:
 *   - stats: Array of objects { label, value, icon: Component, color, prefix?, suffix?, format? }
 */
export default function DashboardStats({ stats }) {
  return (
    <section className="mb-8">
      <h2 className="font-poppins text-lg font-bold text-textDark mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 overflow-hidden relative group cursor-default card-hover"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.07] group-hover:scale-150 transition-transform duration-500 ease-out" style={{ backgroundColor: s.color }} />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:rotate-3 transition-transform duration-300" style={{ backgroundColor: `${s.color}12` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <TrendingUp size={16} className="text-success/60 group-hover:scale-110 transition-transform" />
            </div>
            <p className="font-poppins text-3xl font-bold text-textDark relative z-10">
              {s.prefix || ''}{s.format ? s.value.toLocaleString() : s.value}{s.suffix}
            </p>
            <p className="text-xs text-textMuted mt-1 relative z-10 group-hover:text-textDark transition-colors">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
