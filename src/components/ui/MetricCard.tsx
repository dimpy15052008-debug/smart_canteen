/**
 * MetricCard — Campus Aurora Motion System
 *
 * Changes from original:
 *  - Count-up replaced with useCountUp (zero re-renders, in-view trigger)
 *  - Trend arrow nudge on first enter
 *  - Icon container: hover:scale-105 with SPRING.snappy
 *  - All existing props unchanged
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { SPRING } from '../../lib/motion';

export interface MetricCardProps {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  highlightTone?: 'default' | 'primary' | 'warning' | 'danger' | 'success' | 'ai';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  trend,
  subtitle,
  icon,
  badge,
  onClick,
  className = '',
  highlightTone = 'default',
}) => {
  const { ref: countRef, text: countText } = useCountUp(value, { decimals });

  return (
    <Card
      surface={onClick ? 'interactive' : 'base'}
      padding="md"
      onClick={onClick}
      className={cn('flex flex-col justify-between overflow-hidden', className)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <motion.div
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              whileHover={{ scale: 1.05, transition: { ...SPRING.snappy } }}
            >
              {icon}
            </motion.div>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
        </div>
        {badge}
      </div>

      <div className="my-1">
        <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
          <span>{prefix}</span>
          {/* motion.span writes directly to DOM — zero React re-renders */}
          <motion.span ref={countRef}>{countText}</motion.span>
          <span className="text-lg sm:text-xl font-medium ml-0.5 text-slate-500 dark:text-slate-400">
            {suffix}
          </span>
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {trend ? (
            <div className="flex items-center gap-1 font-medium">
              {trend.isPositive ? (
                <motion.span
                  className="inline-flex items-center text-emerald-600 dark:text-emerald-400"
                  initial={{ y: 4, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3, ease: 'easeOut' }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {trend.value}%
                </motion.span>
              ) : trend.value === 0 ? (
                <span className="inline-flex items-center text-slate-500">
                  <Minus className="w-3.5 h-3.5" />
                  0%
                </span>
              ) : (
                <motion.span
                  className="inline-flex items-center text-rose-600 dark:text-rose-400"
                  initial={{ y: -4, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3, ease: 'easeOut' }}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {trend.value}%
                </motion.span>
              )}
              {trend.label && (
                <span className="text-slate-500 dark:text-slate-400 ml-1">{trend.label}</span>
              )}
            </div>
          ) : (
            <span className="truncate">{subtitle}</span>
          )}
        </div>
      )}
    </Card>
  );
};
