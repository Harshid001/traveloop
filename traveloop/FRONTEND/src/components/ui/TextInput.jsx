import { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Premium accessible text input component with label, error, and dark mode support.
 */
const TextInput = forwardRef(function TextInput({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}, ref) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          className={clsx(
            'w-full rounded-xl border bg-white dark:bg-slate-900/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-200 shadow-2xs',
            Icon ? 'pl-10 pr-3.5 py-2.5' : 'px-4 py-2.5',
            error
              ? 'border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 hover:border-slate-300 dark:hover:border-slate-700',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-danger">{error}</p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

export default TextInput;

