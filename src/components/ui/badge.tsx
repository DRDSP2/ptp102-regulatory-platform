import { type ComponentProps, forwardRef } from 'react';
import { cn } from '../../lib/utils';

type BadgeProps = ComponentProps<'span'> & {
  variant?: 'default' | 'success' | 'warn' | 'danger' | 'outline';
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-ink-800 text-white',
    success: 'bg-emerald-600 text-white',
    warn: 'bg-amber-200 text-amber-900',
    danger: 'bg-red-600 text-white',
    outline: 'border border-ink-200 bg-white text-ink-800',
  };
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-xl px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
