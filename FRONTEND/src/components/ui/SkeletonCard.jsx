import { motion } from 'framer-motion';

/**
 * Skeleton placeholder for a trip card.
 * Props: `className` – additional Tailwind classes.
 */
export default function SkeletonCard({ className = '' }) {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-soft border border-slate-100 animate-pulse ${className}`}
      layout
    >
      <div className="relative h-48 sm:h-52 bg-slate-200" />
      <div className="p-5 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-4 bg-slate-200 rounded w-1/3" />
      </div>
    </motion.div>
  );
}
