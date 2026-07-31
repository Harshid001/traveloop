import { motion } from 'framer-motion';

/**
 * Skeleton placeholder for loading trip cards with shimmer animation and dark mode support.
 */
export default function SkeletonCard({ className = '' }) {
  return (
    <motion.div
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-soft dark:shadow-card-dark border border-slate-200/80 dark:border-slate-800 overflow-hidden ${className}`}
      layout
    >
      <div className="relative h-48 sm:h-52 bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 dark:via-slate-700/30 to-transparent animate-shimmer" />
      </div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-12 animate-pulse" />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 animate-pulse" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-full animate-pulse mt-2" />
      </div>
    </motion.div>
  );
}

