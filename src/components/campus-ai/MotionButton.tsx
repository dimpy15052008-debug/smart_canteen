/**
 * MotionButton — shared animated button primitive for all CampusAI controls.
 *
 * Features:
 *  • Hover lift 1-2px + soft glow in the button's accent
 *  • Press scale 0.96 with spring-back overshoot
 *  • Focus-visible ring (2px, offset 2px) via CSS
 *  • Disabled = no motion + dimmed
 *  • Reduced-motion = opacity/brightness feedback only
 */
import React, { useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SPRING_SNAPPY } from './motion';

interface MotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Extra Tailwind/CSS classes */
  className?: string;
  /** Framer variants key override (default: uses whileHover/whileTap) */
  hoverY?: number;
  hoverScale?: number;
  tapScale?: number;
  /** Accessible label for icon-only buttons */
  'aria-label'?: string;
}

export const MotionButton = React.memo(React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    {
      children,
      className = '',
      hoverY = -1,
      hoverScale = 1.02,
      tapScale = 0.96,
      disabled,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const shouldReduceMotion = useReducedMotion();

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(e);
    }, [disabled, onClick]);

    const motionProps = shouldReduceMotion
      ? {
          // Reduced motion: subtle brightness change only
          whileHover: disabled ? {} : { filter: 'brightness(1.08)' },
          whileTap:   disabled ? {} : { filter: 'brightness(0.92)' },
        }
      : {
          whileHover: disabled ? {} : { y: hoverY, scale: hoverScale },
          whileTap:   disabled ? {} : { scale: tapScale },
          transition: SPRING_SNAPPY,
        };

    return (
      <motion.button
        ref={ref}
        className={`${className} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        disabled={disabled}
        onClick={handleClick}
        {...motionProps}
        {...(rest as any)}
      >
        {children}
      </motion.button>
    );
  },
));

MotionButton.displayName = 'MotionButton';

// ─── Icon-only button variant (44px touch target, tooltip recommended) ────────
export const MotionIconButton = React.memo(React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, className = '', ...props }, ref) => (
    <MotionButton
      ref={ref}
      className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl ${className}`}
      {...props}
    >
      {children}
    </MotionButton>
  ),
));

MotionIconButton.displayName = 'MotionIconButton';
