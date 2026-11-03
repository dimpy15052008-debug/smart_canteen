import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type StepStatus = 'upcoming' | 'active' | 'completed' | 'failed';

export interface TimelineStep {
  id: string | number;
  label: string;
  description?: string;
  timestamp?: string;
  status: StepStatus;
  icon?: React.ReactNode;
}

export interface StepTimelineProps {
  steps: TimelineStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const StepTimeline: React.FC<StepTimelineProps> = ({
  steps,
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={cn('relative space-y-4 pl-2', className)}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isFailed = step.status === 'failed';

          return (
            <div key={step.id} className="relative flex items-start gap-3.5 group">
              {/* Connecting vertical rail */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-4 top-8 -bottom-4 w-0.5 transition-colors',
                    isCompleted
                      ? 'bg-emerald-500 dark:bg-emerald-600'
                      : isActive
                      ? 'bg-indigo-300 dark:bg-indigo-700'
                      : 'bg-slate-200 dark:bg-slate-800'
                  )}
                />
              )}

              {/* Status node */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border transition-all',
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-500/20'
                    : isFailed
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isFailed ? (
                  <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                ) : isActive ? (
                  step.icon || <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : (
                  step.icon || <span>{index + 1}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isCompleted
                        ? 'text-slate-900 dark:text-slate-100'
                        : isFailed
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.timestamp}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between relative">
        {/* Background connecting rail */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />

        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isFailed = step.status === 'failed';

          return (
            <div
              key={step.id}
              className="flex-1 flex flex-col items-center text-center relative z-10"
            >
              {/* Node */}
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border transition-all',
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-500/20'
                    : isFailed
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isFailed ? (
                  <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  step.icon || <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="mt-2 px-1">
                <span
                  className={cn(
                    'block text-xs font-semibold',
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isCompleted
                      ? 'text-slate-900 dark:text-slate-100'
                      : isFailed
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="hidden sm:block text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
