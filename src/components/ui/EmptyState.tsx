/**
 * EmptyState — Campus Aurora Motion System
 *
 * Changes from original:
 *  - Icon floats with animate-float (6s, pauses when tab hidden)
 *  - CTA button fades up 150ms after icon settles
 *  - All existing props unchanged
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl',
        'border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30',
        className
      )}
    >
      {icon && (
        /* animate-float: translates Y 6px over 6s, pauses when tab hidden */
        <div className="animate-float flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">{description}</p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button
            variant="primary"
            size="sm"
            onClick={action.onClick}
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </div>
  );
};
