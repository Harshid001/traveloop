import { clsx } from 'clsx';
import { motion } from 'framer-motion';

/**
 * Reusable Button — Premium SaaS button with smooth press animations and dark mode support
 * Variants: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass'
 * Sizes: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  onClick,
  disabled,
  ...props
}) {
  const base =
    'font-poppins font-bold rounded-xl transition-all duration-200 ease-out cursor-pointer inline-flex items-center justify-center gap-2 text-sm select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:focus-visible:ring-primary/80 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

  const sizes = {
    sm: 'px-3.5 py-2 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-2xl',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-primary to-accent text-white shadow-sm hover:shadow-md hover:brightness-110 border border-transparent',
    secondary:
      'border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs',
    outline:
      'border border-primary/30 dark:border-primary/50 text-primary dark:text-primary-light bg-transparent hover:bg-primary/5 dark:hover:bg-primary/10',
    ghost:
      'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
    danger:
      'bg-danger text-white hover:bg-red-600 shadow-sm border border-transparent',
    glass:
      'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-900 shadow-md',
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? {} : { y: -1 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      className={clsx(base, sizes[size], variants[variant], className)}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </motion.button>
  );
}

