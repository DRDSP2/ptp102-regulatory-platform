import { type ComponentProps, forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Select = forwardRef<HTMLSelectElement, ComponentProps<'select'> & { label?: string; hint?: string; error?: string }>(
  ({ className, label, hint, error, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <label className="block">
        {label && <span className="block text-xs font-medium text-ink-700">{label}</span>}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(45,138,247,0.12)]',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {hint && !error && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
        {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
      </label>
    );
  }
);
Select.displayName = 'Select';

export { Select };
