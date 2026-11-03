/**
 * PageHeader — Campus Aurora Motion System
 *
 * Changes from original:
 *  - Title fades up on mount, then actions fade up 50ms later
 *  - All existing props unchanged
 */
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { fadeUp, stagger } from '../../lib/motion';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  breadcrumbs,
  className = '',
}) => {
  return (
    <motion.div
      variants={stagger(0.05)}
      initial="hidden"
      animate="show"
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800/80 mb-6',
        className
      )}
    >
      <motion.div variants={fadeUp} className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <span>/</span>}
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? 'text-slate-600 dark:text-slate-300 font-medium'
                      : ''
                  }
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* tabIndex=-1 lets focus be moved here programmatically after route change */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white" tabIndex={-1}>
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {subtitle}
          </p>
        )}
      </motion.div>

      {action && (
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};
