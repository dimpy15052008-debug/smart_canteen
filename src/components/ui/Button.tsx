/**
 * Button — Campus Aurora Motion System
 *
 * New features (all props optional, existing call sites unchanged):
 *  - Ripple from pointer position on press
 *  - status: 'idle' | 'loading' | 'success' | 'error'
 *    icon swaps animate with AnimatePresence, error shakes once
 *  - Press scale (0.97) + 1 px lift on hover via CSS (compositor only)
 *  - Shine sweep on primary and ai variants (.btn-shine)
 *
 * Existing props still work: variant, size, isLoading, leftIcon, rightIcon,
 *   disabled, className, all native button attrs.
 */
import React, { useCallback, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Variants ────────────────────────────────────────────────────────────────

export const buttonVariants = cva(
  // Base: overflow hidden is required for ripple; isolation for btn-shine z-index
  'relative inline-flex items-center justify-center overflow-hidden font-medium rounded-lg select-none ' +
  'transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-[90ms] ease-out ' +
  // Lift on hover, press scale — CSS only (compositor)
  'motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97] ' +
  'disabled:opacity-50 disabled:pointer-events-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'btn-shine bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm ' +
          'hover:shadow-lg hover:shadow-indigo-500/25 active:bg-indigo-800',
        secondary:
          'bg-slate-100 hover:bg-slate-200 text-slate-800 ' +
          'dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 ' +
          'border border-slate-200 dark:border-slate-700',
        outline:
          'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 ' +
          'text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700',
        ghost:
          'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 ' +
          'text-slate-700 dark:text-slate-300',
        danger:
          'bg-rose-600 hover:bg-rose-700 text-white shadow-sm ' +
          'hover:shadow-lg hover:shadow-rose-500/25',
        ai:
          'btn-shine bg-gradient-to-r from-violet-600 to-indigo-600 ' +
          'hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm ' +
          'shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/30',
      },
      size: {
        sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
        md: 'text-sm px-3.5 py-2 gap-2 h-9',
        lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

// ─── Animated check icon ─────────────────────────────────────────────────────

const AnimatedCheck: React.FC = () => (
  <motion.svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <motion.path
      d="M5 13l4 4L19 7"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    />
  </motion.svg>
);

// ─── Types ───────────────────────────────────────────────────────────────────

type Ripple = { id: number; x: number; y: number; size: number };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  /**
   * Result state. Caller resets to 'idle' after ~1.6 s.
   * 'error' triggers a one-shot shake + red icon; 'success' draws a check stroke.
   */
  status?: 'idle' | 'success' | 'error';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      status = 'idle',
      disabled,
      leftIcon,
      rightIcon,
      children,
      onPointerDown,
      ...props
    },
    ref
  ) => {
    const reduce = useReducedMotion();
    const [ripples, setRipples] = useState<Ripple[]>([]);

    // ── Ripple handler (skipped in reduced-motion / disabled / loading) ──────
    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(e);
        if (reduce || disabled || isLoading) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        setRipples((prev) => [
          ...prev.slice(-2), // max 3 concurrent ripples
          {
            id: Date.now() + Math.random(),
            x: e.clientX - rect.left - size / 2,
            y: e.clientY - rect.top - size / 2,
            size,
          },
        ]);
      },
      [onPointerDown, reduce, disabled, isLoading]
    );

    // ── Resolve which icon to show ───────────────────────────────────────────
    const stateKey = isLoading ? 'loading' : status;
    const statusIcon =
      stateKey === 'loading' ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : stateKey === 'success' ? (
        <AnimatedCheck />
      ) : stateKey === 'error' ? (
        <X className="w-4 h-4" aria-hidden="true" />
      ) : null;

    // Show status icon OR the leftIcon passed by the caller
    const leadIcon = statusIcon ?? leftIcon;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onPointerDown={handlePointerDown}
        className={cn(
          buttonVariants({ variant, size }),
          status === 'error' && !reduce && 'animate-shake',
          className
        )}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {/* ── Animated icon slot ─────────────────────────────────────────── */}
        <AnimatePresence mode="popLayout" initial={false}>
          {leadIcon ? (
            <motion.span
              key={stateKey === 'loading' ? 'loading' : stateKey === 'success' ? 'success' : stateKey === 'error' ? 'error' : 'left'}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="inline-flex shrink-0"
            >
              {leadIcon}
            </motion.span>
          ) : null}
        </AnimatePresence>

        <span>{children}</span>

        {/* ── Right icon (never shown while loading/status active) ──────── */}
        {stateKey === 'idle' && rightIcon}

        {/* ── Ripple layer ─────────────────────────────────────────────── */}
        {ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-white/30 animate-ripple"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            onAnimationEnd={() =>
              setRipples((prev) => prev.filter((p) => p.id !== r.id))
            }
          />
        ))}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ─── Helper hook: manage loading→success/error cycle ─────────────────────────

/**
 * useButtonStatus — manages the idle→loading→success|error→idle lifecycle.
 *
 * @example
 *   const { status, run } = useButtonStatus();
 *   <Button status={status} onClick={() => run(asyncFn())} />
 */
export function useButtonStatus(resetDelay = 1600) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const run = async (promise: Promise<unknown>) => {
    setStatus('loading');
    try {
      await promise;
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), resetDelay);
    }
  };

  return { status, run, setStatus };
}
