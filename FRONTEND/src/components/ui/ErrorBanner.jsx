import { clsx } from 'clsx';
import { motion } from 'framer-motion';

/**
 * Displays an error message with a retry button.
 * Props:
 *   - error: the error object or message
 *   - refetch: function to retry the query
 */
export default function ErrorBanner({ error, refetch }) {
  return (
    <motion.div
      className={clsx('bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center justify-between', 'animate-pulse')}
      role="alert"
    >
      <div className="text-sm">{error?.message || 'Failed to load data.'}</div>
      <button
        onClick={refetch}
        className={clsx('ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600')}
        aria-label="Retry"
      >
        Retry
      </button>
    </motion.div>
  );
}
