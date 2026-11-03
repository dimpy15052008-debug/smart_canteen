/**
 * StatusPill — Campus Aurora Motion System
 *
 * Changes from original:
 *  - animate-ping (pulse) only renders when the pill is on-screen (useInView)
 *  - Status/label changes cross-fade in 200ms via AnimatePresence
 *  - All existing props unchanged
 */
import React, { useRef } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { cn } from '../../lib/utils';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'ai';

export interface StatusPillProps {
  status: StatusTone;
  label: string;
  pulse?: boolean;
  className?: string;
}

const toneStyles: Record<StatusTone, { bg: string; text: string; dot: string; border: string }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800/80',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800/80',
  },
  danger: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    border: 'border-rose-200 dark:border-rose-800/80',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
    border: 'border-sky-200 dark:border-sky-800/80',
  },
  neutral: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
  },
  ai: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-500',
    border: 'border-violet-200 dark:border-violet-800/80',
  },
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  pulse = false,
  className = '',
}) => {
  const pillRef = useRef<HTMLSpanElement>(null);
  // Only render the ping layer while in the viewport — prevents off-screen loops
  const inView = useInView(pillRef, { margin: '0px' });
  const current = toneStyles[status] || toneStyles.neutral;
  // Composite key so both label AND status changes trigger cross-fade
  const stateKey = `${status}::${label}`;

  return (
    <span
      ref={pillRef}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none',
        'transition-[background-color,border-color,color] duration-200',
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {/* Ping only when in view — keeps looping budget ≤ 3 visible at once */}
        {pulse && inView && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              current.dot
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', current.dot)} />
      </span>

      {/* Cross-fade label when status or text changes */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={stateKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
