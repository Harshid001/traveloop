import { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Simple styled text input component.
 * Accepts all standard input props and merges Tailwind classes.
 */
const TextInput = forwardRef(function TextInput({ className = '', ...props }, ref) {
  const base =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-textDark placeholder:text-textMuted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors';
  return (
    <input ref={ref} className={clsx(base, className)} {...props} />
  );
});

export default TextInput;
