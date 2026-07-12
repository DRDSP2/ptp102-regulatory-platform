import { cn } from '../../lib/utils';

type SpinnerProps = { size?: number; className?: string };

function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <div role="status" aria-label="Loading" className={cn('inline-block', className)}>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="animate-spin text-ink-900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path d="M4 12a10 10 0 0 1 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default Spinner;
