import { type ComponentProps, forwardRef } from 'react';
import { cn } from '../../lib/utils';

type InputProps = ComponentProps<'input'> & { label?: string; hint?: string; error?: string };

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, hint, error, id, ...props }, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="field">
      {label ? (
        <label htmlFor={inputId} className="block text-xs font-medium text-ink-600">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400',
          'focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(45,138,247,0.12)]',
          error && 'border-red-400 focus:border-red-500',
          className
        )}
        {...props}
      />
      {hint ? <div className="hint">{hint}</div> : null}
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
