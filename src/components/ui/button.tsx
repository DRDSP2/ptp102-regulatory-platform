import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap motion-safe:animate-fade-in',
  {
    defaultVariants: { variant: 'default', size: 'default' },
    variants: {
      variant: {
        default: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-900 shadow-soft',
        secondary: 'bg-ink-100 text-ink-900 hover:bg-ink-200 active:bg-ink-300',
        ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200',
        outline: 'border border-ink-200 bg-white text-ink-900 hover:bg-ink-50 hover:border-ink-300',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
  }
);

export type { VariantProps };
export const ButtonProps = {} as any;

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

const Button = ({ className, variant, size, ...props }: Props) => (
  <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
);

export default Button;
