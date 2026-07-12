import { type ComponentProps } from 'react';
import { cn } from '../../lib/utils';

type CardProps = ComponentProps<'div'> & { elevated?: boolean };

const Card = ({ className, elevated = false, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'panel',
        elevated && 'shadow-floating',
        className
      )}
      {...props}
    />
  );
};

export { Card };
