/**
 * Card — Campus Aurora Motion System
 *
 * Changes from original:
 *  - `transition-all` replaced with specific `transition-[transform,box-shadow,border-color]`
 *  - interactive surface: hover lift `-translate-y-0.5`, deeper shadow, border color shift
 *  - All existing props (surface, padding, className, ref) unchanged
 */
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const cardVariants = cva(
  // NOTE: transition-all replaced with targeted properties only (no layout thrash)
  'rounded-xl transition-[transform,box-shadow,border-color,background-color] duration-200 relative border',
  {
    variants: {
      surface: {
        base:
          'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm',
        elevated:
          'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 ' +
          'shadow-md shadow-slate-900/5 dark:shadow-black/20',
        interactive:
          'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm ' +
          'hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md ' +
          'motion-safe:hover:-translate-y-0.5 cursor-pointer ' +
          'active:scale-[0.995] active:translate-y-0',
        subtle:
          'bg-slate-50/70 dark:bg-slate-900/50 ' +
          'border-slate-200/60 dark:border-slate-800/60',
        ai:
          'bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-transparent ' +
          'dark:from-violet-950/20 dark:via-indigo-950/20 ' +
          'border-violet-200/60 dark:border-violet-800/40 shadow-sm',
      },
      padding: {
        none: 'p-0',
        sm:   'p-3 sm:p-4',
        md:   'p-4 sm:p-5',
        lg:   'p-5 sm:p-6',
      },
    },
    defaultVariants: {
      surface: 'base',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, surface, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ surface, padding, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
