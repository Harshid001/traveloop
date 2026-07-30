import { clsx } from 'clsx';

/**
 * Glassmorphism card wrapper — used for headers, modals, hero cards
 */
export default function GlassCard({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'glass-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
