/**
 * Skeleton — Campus Aurora Motion System
 *
 * Replaces `animate-pulse` with compositor-safe shimmer (.skeleton class).
 * The shimmer sweeps translateX -100%→100%, staying off the main thread.
 * Aria-hidden preserved. All existing props unchanged.
 */
import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn(
        // .skeleton adds the shimmer ::after layer (see index.css)
        'skeleton',
        variant === 'circle' && 'rounded-full',
        variant === 'text'   && 'h-4 w-full rounded',
        variant === 'rect'   && 'rounded-xl',
        className
      )}
      {...props}
    />
  );
};
