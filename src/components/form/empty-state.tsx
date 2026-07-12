import { cn } from '../../lib/utils';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('panel p-10 text-center', className)}>
      <div className="text-sm font-semibold text-ink-900">{title}</div>
      {description && <p className="mt-1 text-xs text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { EmptyState };
