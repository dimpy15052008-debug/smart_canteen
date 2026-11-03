import React from 'react';
import { cn } from '../../lib/utils';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 mb-3.5',
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
