import { clsx } from 'clsx';
import { motion } from 'framer-motion';

/**
 * Reusable Button — Professional pill-shaped buttons
 * Variants: 'primary' | 'secondary' | 'ghost'
 */
export default function Button({ children, variant = 'primary', className = '', onClick, disabled, ...props }) {
  const base =
    'font-poppins font-semibold rounded-xl transition-all duration-300 ease-out cursor-pointer inline-flex min-h-11 items-center justify-center gap-2 text-sm leading-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-primary text-white px-7 py-3.5 shadow-sm hover:bg-primary-dark hover:shadow-md border border-transparent',
    secondary:
      'border border-slate-200 text-textDark bg-white px-7 py-3 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
    ghost:
      'text-primary hover:bg-primary/5 px-5 py-2.5',
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={clsx(base, variants[variant], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

