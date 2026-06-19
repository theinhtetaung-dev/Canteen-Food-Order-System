import React from 'react';
import { cn } from '../../lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, ...props }, ref) => {
    const Component = `h${level}` as const;
    
    const sizes = {
      1: 'text-4xl font-extrabold tracking-tight lg:text-5xl',
      2: 'text-3xl font-semibold tracking-tight first:mt-0',
      3: 'text-2xl font-semibold tracking-tight',
      4: 'text-xl font-semibold tracking-tight',
      5: 'text-lg font-semibold tracking-tight',
      6: 'text-base font-semibold tracking-tight',
    };

    return (
      <Component
        ref={ref}
        className={cn(sizes[level], 'text-slate-900 dark:text-slate-50', className)}
        {...props}
      />
    );
  }
);
Heading.displayName = 'Heading';
