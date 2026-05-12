import { clsx } from 'clsx';
import { motion } from 'framer-motion';

/**
 * Reusable Button — Professional pill-shaped buttons
 * Variants: 'primary' | 'secondary' | 'ghost'
 */
export default function Button({ children, variant = 'primary', className = '', onClick, ...props }) {
  const base =
    'font-poppins font-semibold rounded-xl transition-colors duration-300 ease-out cursor-pointer inline-flex min-h-11 items-center justify-center gap-2 text-sm leading-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70';

  const variants = {
    primary:
      'bg-primary text-white px-7 py-3.5 shadow-md hover:bg-primary-dark hover:shadow-lg',
    secondary:
      'border-2 border-primary text-primary bg-white px-7 py-3 hover:bg-surface hover:shadow-md',
    ghost:
      'text-primary hover:bg-surface px-5 py-2.5',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(base, variants[variant], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}
