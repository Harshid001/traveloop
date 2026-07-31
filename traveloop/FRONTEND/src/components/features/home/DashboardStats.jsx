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
          <h2 className="font-poppins text-xl font-extrabold text-textDark tracking-tight">Travel Overview</h2>
          <p className="text-textMuted text-xs mt-0.5">Your journey statistics at a glance</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100/80 overflow-hidden relative group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-hover hover:border-primary/20"
          >
            {/* Background glowing gradient orb */}
            <div
              className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-[0.08] group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"
              style={{ backgroundColor: s.color }}
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm"
                style={{ backgroundColor: `${s.color}14` }}
              >
                <s.icon size={22} style={{ color: s.color }} />
              </div>

              {s.badge ? (
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-0.5 shadow-2xs"
                  style={{
                    backgroundColor: `${s.color}10`,
                    borderColor: `${s.color}25`,
                    color: s.color,
                  }}
                >
                  <ArrowUpRight size={12} />
                  {s.badge}
                </span>
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={14} />
                </div>
              )}
            </div>

            <div className="relative z-10">
              <p className="font-poppins text-3xl font-extrabold text-textDark tracking-tight group-hover:text-primary transition-colors">
                {s.prefix || ''}
                {s.format ? s.value.toLocaleString() : s.value}
                {s.suffix}
              </p>
              <p className="text-xs font-medium text-textMuted mt-1 group-hover:text-slate-600 transition-colors">
                {s.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

