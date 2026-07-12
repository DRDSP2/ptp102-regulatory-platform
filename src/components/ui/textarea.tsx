import { type ComponentProps, forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400',
          'focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(45,138,247,0.12)]',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
