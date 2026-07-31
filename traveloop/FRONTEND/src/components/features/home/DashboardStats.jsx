import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

/**
 * Displays animated statistic cards on the home dashboard.
 * Props:
 *   - stats: Array of objects { label, value, icon: Component, color, prefix?, suffix?, format?, badge? }
 */
export default function DashboardStats({ stats }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Travel Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Your journey statistics at a glance</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200/80 dark:border-slate-700/80 overflow-hidden relative group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-hover hover:border-primary/40 dark:hover:border-primary/50"
          >
            {/* Background glowing gradient orb */}
            <div
              className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-[0.12] dark:opacity-[0.2] group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"
              style={{ backgroundColor: s.color || '#4F46E5' }}
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm"
                style={{ backgroundColor: `${s.color || '#4F46E5'}18` }}
              >
                <s.icon size={22} style={{ color: s.color || '#4F46E5' }} />
              </div>

              {s.badge ? (
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-0.5 shadow-2xs"
                  style={{
                    backgroundColor: `${s.color || '#4F46E5'}15`,
                    borderColor: `${s.color || '#4F46E5'}30`,
                    color: s.color || '#4F46E5',
                  }}
                >
                  <ArrowUpRight size={12} />
                  {s.badge}
                </span>
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp size={14} />
                </div>
              )}
            </div>

            <div className="relative z-10">
              <p className="font-poppins text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                {s.prefix || ''}
                {s.format ? s.value.toLocaleString() : s.value}
                {s.suffix}
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                {s.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


