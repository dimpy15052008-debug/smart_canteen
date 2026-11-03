import { useState, useEffect, useRef, useCallback } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { SPRING } from './tokens';

/**
 * Hook to detect prefers-reduced-motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to track document visibility (tab hidden / active)
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () => {
      setIsVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return isVisible;
}

/**
 * Hook for pointer parallax on desktop (disabled on touch & reduced motion)
 */
export function usePointerParallax(strength: number = 10): {
  x: MotionValue<number>;
  y: MotionValue<number>;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
} {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 120, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 120, damping: 20 });
  const reduced = usePrefersReducedMotion();

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (reduced) return;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = ((clientX - centerX) / centerX) * strength;
    const offsetY = ((clientY - centerY) / centerY) * strength;
    rawX.set(offsetX);
    rawY.set(offsetY);
  }, [reduced, strength, rawX, rawY]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { x: springX, y: springY, handleMouseMove, handleMouseLeave };
}

/**
 * Hook for spotlight cursor tracking on an element via CSS variables --mx and --my
 */
export function useSpotlight<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.style.setProperty('--mx', `${x}px`);
        ref.current.style.setProperty('--my', `${y}px`);
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (ref.current) {
      ref.current.style.removeProperty('--mx');
      ref.current.style.removeProperty('--my');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}

/**
 * Hook for subtle 3D card tilt (max 4deg)
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxTilt: number = 4) {
  const ref = useRef<T>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, SPRING.soft);
  const springY = useSpring(rotateY, SPRING.soft);
  const reduced = usePrefersReducedMotion();

  const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (reduced || !ref.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;

    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    rotateY.set(x * maxTilt * 2);
    rotateX.set(-y * maxTilt * 2);
  }, [reduced, maxTilt, rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return { ref, rotateX: springX, rotateY: springY, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}

/**
 * Hook for magnetic button pull (±6px)
 */
export function useMagnetic(maxDistance: number = 6) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING.magnetic);
  const springY = useSpring(y, SPRING.magnetic);
  const reduced = usePrefersReducedMotion();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    x.set(deltaX * maxDistance);
    y.set(deltaY * maxDistance);
  }, [reduced, maxDistance, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { x: springX, y: springY, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}

/**
 * Hook for typewriter text simulation
 */
export function useTypewriter(
  targetText: string,
  speedMs: number = 35,
  autoStart: boolean = false,
  onComplete?: () => void
): {
  displayText: string;
  isTyping: boolean;
  start: (text?: string) => void;
  reset: () => void;
} {
  const [displayText, setDisplayText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText('');
    setIsTyping(false);
  }, []);

  const start = useCallback((textToType?: string) => {
    const finalStr = textToType !== undefined ? textToType : targetText;
    if (!finalStr) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText('');
    setIsTyping(true);

    let idx = 0;
    intervalRef.current = window.setInterval(() => {
      idx++;
      if (idx <= finalStr.length) {
        setDisplayText(finalStr.slice(0, idx));
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTyping(false);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speedMs);
  }, [targetText, speedMs]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoStart, start]);

  return { displayText, isTyping, start, reset };
}
