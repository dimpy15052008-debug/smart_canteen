/**
 * useCountUp — zero React re-render count-up animation.
 *
 * Uses framer-motion MotionValue + useTransform to write directly to the DOM,
 * avoiding the per-frame setState that re-renders the entire card component.
 * Only starts when the element scrolls into view (IntersectionObserver via useInView).
 *
 * Usage:
 *   const { ref, text } = useCountUp(value, { decimals: 1, duration: 0.9 });
 *   <motion.span ref={ref}>{text}</motion.span>
 */
import { useEffect, useRef } from 'react';
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';

export interface CountUpOptions {
  decimals?: number;
  duration?: number;
}

export function useCountUp(value: number, opts: CountUpOptions = {}) {
  const { decimals = 0, duration = 0.9 } = opts;
  const ref = useRef<HTMLSpanElement>(null);
  // Trigger once when 10% of the element is visible
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();

  // Start at final value in reduced-motion mode so there is no count animation
  const mv = useMotionValue(reduce ? value : 0);

  // Transform the MotionValue to a formatted string — no React state involved
  const text = useTransform(mv, (v) =>
    v.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    if (!inView) return;

    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [value, inView, reduce, duration, mv]);

  return { ref, text };
}
