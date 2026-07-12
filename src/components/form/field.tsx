import { type ComponentProps, forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Field = forwardRef<HTMLInputElement, ComponentProps<'input'> & { label?: string; hint?: string; error?: string }>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <label className="block">
        {label && <span className="block text-xs font-medium text-ink-700">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(45,138,247,0.12)] disabled:bg-ink-50 disabled:text-ink-500',
            className
          )}
          {...props}
        />
        {hint && !error && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
        {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
      </label>
    );
  }
);
Field.displayName = 'Field';

export { Field };
