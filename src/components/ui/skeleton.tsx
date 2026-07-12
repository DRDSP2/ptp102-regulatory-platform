import { cn } from '../../lib/utils';

type SkeletonProps = { className?: string };

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded-xl bg-ink-200/70',
        className
      )}
    />
  );
}

export { Skeleton };
