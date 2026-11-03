/**
 * ErrorState — Campus Aurora Motion System
 *
 * Changes from original:
 *  - Icon does one animate-shake on mount
 *  - Retry button gets isLoading state (already passed via isRetrying)
 *  - All existing props unchanged
 */
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  isRetrying,
  secondaryAction,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl',
        'border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20',
        className
      )}
    >
      {/* One-shot shake on mount (animate-shake) */}
      <motion.div
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 mb-3 border border-rose-200 dark:border-rose-800"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <AlertCircle className="w-6 h-6 animate-shake" aria-hidden="true" />
      </motion.div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mb-4">{message}</p>
      <div className="flex items-center gap-2.5">
        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        )}
        {secondaryAction && (
          <Button variant="secondary" size="sm" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};
