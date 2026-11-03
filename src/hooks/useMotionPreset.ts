/**
 * useMotionPreset — backward-compatible hook re-exporting Campus Aurora tokens.
 * Existing call sites (StudentLayout, App.tsx, DesignSystemShowcase) still work.
 * New code should import directly from '../../lib/motion'.
 */
import { useReducedMotion } from 'framer-motion';

// Re-export everything from the token library so callers can do:
//   import { DUR, SPRING, fadeUp } from '../hooks/useMotionPreset';
export * from '../lib/motion';

export function useMotionPreset() {
  const shouldReduceMotion = useReducedMotion();

  return {
    shouldReduceMotion,
    /** Backward-compat: page-level variant object used by StudentLayout + App.tsx */
    pageTransition: {
      initial: {
        opacity: 0,
        y: shouldReduceMotion ? 0 : 8,
      },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0.05 : 0.22,
          ease: 'easeOut',
        },
      },
      exit: {
        opacity: 0,
        y: shouldReduceMotion ? 0 : -6,
        transition: {
          duration: shouldReduceMotion ? 0.05 : 0.15,
        },
      },
    },
    /** Backward-compat duration map */
    durations: {
      micro:   shouldReduceMotion ? 0.01 : 0.12,
      standard: shouldReduceMotion ? 0.01 : 0.2,
      surface:  shouldReduceMotion ? 0.01 : 0.32,
    },
    /** Backward-compat spring */
    spring: {
      type: 'spring' as const,
      stiffness: shouldReduceMotion ? 1000 : 400,
      damping:   shouldReduceMotion ? 100  : 30,
    },
  };
}
