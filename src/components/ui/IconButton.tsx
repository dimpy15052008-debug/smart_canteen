/**
 * IconButton — Campus Aurora Motion System
 *
 * Changes from original:
 *  - Ripple from pointer position (same as Button)
 *  - Press scale 0.97 via CSS (compositor only)
 *  - Hover lift 1px (hover devices only)
 *  - transition-all → transition-[background-color,box-shadow,opacity]
 *  - All existing props unchanged (aria-label required)
 */
import React, { useCallback, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const iconButtonVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-lg ' +
  'transition-[background-color,box-shadow,opacity,transform] duration-[90ms] ease-out select-none ' +
  'disabled:opacity-50 disabled:pointer-events-none ' +
  'motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.97] motion-safe:active:translate-y-0 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
  {
    variants: {
      variant: {
        ghost:
          'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
        outline:
          'text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 ' +
          'hover:bg-slate-100 dark:hover:bg-slate-800/80',
        primary:
          'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
        subtle:
          'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 ' +
          'hover:bg-slate-200 dark:hover:bg-slate-800',
      },
      size: {
        sm: 'w-8 h-8 p-1.5',
        md: 'w-9 h-9 p-2',
        lg: 'w-11 h-11 p-2.5',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

type Ripple = { id: number; x: number; y: number; size: number };

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  'aria-label': string; // Enforce accessible label
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, children, onPointerDown, disabled, ...props }, ref) => {
    const reduce = useReducedMotion();
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(e);
        if (reduce || disabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const sz = Math.max(rect.width, rect.height) * 2;
        setRipples((prev) => [
          ...prev.slice(-1),
          { id: Date.now(), x: e.clientX - rect.left - sz / 2, y: e.clientY - rect.top - sz / 2, size: sz },
        ]);
      },
      [onPointerDown, reduce, disabled]
    );

    return (
      <button
        ref={ref}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        className={cn(iconButtonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
        {ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-current opacity-20 animate-ripple"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            onAnimationEnd={() => setRipples((prev) => prev.filter((p) => p.id !== r.id))}
          />
        ))}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
