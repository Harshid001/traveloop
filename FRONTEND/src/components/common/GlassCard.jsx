import { clsx } from 'clsx';

/**
 * Glassmorphism card wrapper
 */
export default function GlassCard({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-white/65 backdrop-blur-[20px] border border-white/35 rounded-2xl shadow-soft p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
