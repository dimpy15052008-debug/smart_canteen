/**
 * useButtonPointer.ts
 * Core hook that drives all pointer-based effects for the auth button.
 * Returns motion values, pointer event handlers, and state flags.
 * ZERO React state updates on pointermove — all hot-path work is via
 * MotionValues or direct CSS variable writes in a rAF loop.
 */
import {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import {
  useMotionValue,
  useSpring,
  type MotionValue,
} from 'framer-motion';
import type { UserRole } from '../../types';
import { ROLE_PERSONALITIES } from './rolePersonalities';

export type ButtonPointerState =
  | 'idle'
  | 'near'
  | 'hover'
  | 'pressed'
  | 'submitting'
  | 'success'
  | 'error'
  | 'disabled';

/** Zone padding (px) outside button bounds that activates magnetic pull */
const MAGNETIC_ZONE_PAD = 48;

export interface ButtonPointerReturn {
  /** Magnetic x offset for the button body */
  magnetX: MotionValue<number>;
  /** Magnetic y offset for the button body */
  magnetY: MotionValue<number>;
  /** Tilt rotateX (spring) */
  tiltX: MotionValue<number>;
  /** Tilt rotateY (spring) */
  tiltY: MotionValue<number>;
  /** Current interaction state */
  state: ButtonPointerState;
  /** Whether the device is coarse pointer (touch) */
  isCoarse: boolean;
  /** Whether reduced motion is preferred */
  reducedMotion: boolean;
  /** Ref to attach to the button element */
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  /** Ref to the wrapping div (magnetic zone) */
  zoneRef: React.RefObject<HTMLDivElement | null>;
  /** Zone-level pointer event handlers */
  zoneHandlers: {
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
  };
  /** Button-level pointer event handlers */
  buttonHandlers: {
    onPointerEnter: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
  };
  /** Latest pointer position inside button (0-1 normalized) */
  pointerNX: MotionValue<number>;
  pointerNY: MotionValue<number>;
}

function useIsCoarse(): boolean {
  const [coarse, setCoarse] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const handler = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return coarse;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export function useButtonPointer(
  role: UserRole,
  externalState: 'submitting' | 'success' | 'error' | 'disabled' | null,
): ButtonPointerReturn {
  const personality = ROLE_PERSONALITIES[role];
  const isCoarse = useIsCoarse();
  const reducedMotion = useReducedMotion();

  // ── Interaction state ──────────────────────────────────────────────────────
  const [state, setState] = useState<ButtonPointerState>('idle');

  // External state always wins
  useEffect(() => {
    if (externalState) {
      setState(externalState);
    } else {
      setState((prev) => {
        // Return to idle only if we were in an external state
        if (prev === 'submitting' || prev === 'success' || prev === 'error' || prev === 'disabled') {
          return 'idle';
        }
        return prev;
      });
    }
  }, [externalState]);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const isHoveredRef = useRef(false);
  const isPressedRef = useRef(false);

  // ── Motion values ──────────────────────────────────────────────────────────
  const rawMagnetX = useMotionValue(0);
  const rawMagnetY = useMotionValue(0);
  const rawTiltX   = useMotionValue(0);
  const rawTiltY   = useMotionValue(0);
  const pointerNX  = useMotionValue(0.5);
  const pointerNY  = useMotionValue(0.5);

  const { magnet: magnetSpring, tilt: tiltSpring } = personality.springs;

  const magnetX = useSpring(rawMagnetX, magnetSpring);
  const magnetY = useSpring(rawMagnetY, magnetSpring);
  const tiltX   = useSpring(rawTiltX, tiltSpring);
  const tiltY   = useSpring(rawTiltY, tiltSpring);

  // ── Cache rect on resize/scroll ────────────────────────────────────────────
  const updateRect = useCallback(() => {
    if (buttonRef.current) {
      rectRef.current = buttonRef.current.getBoundingClientRect();
    }
  }, []);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const isEffectsBlocked = useCallback((): boolean => {
    return (
      externalState === 'submitting' ||
      externalState === 'success' ||
      externalState === 'disabled'
    );
  }, [externalState]);

  const writeCSSVars = useCallback((nx: number, ny: number) => {
    const el = buttonRef.current;
    if (!el) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${(nx * rect.width).toFixed(1)}px`);
      el.style.setProperty('--my', `${(ny * rect.height).toFixed(1)}px`);
    });
  }, []);

  const clearCSSVars = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const el = buttonRef.current;
    if (el) {
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    }
  }, []);

  const resetMagnetAndTilt = useCallback(() => {
    rawMagnetX.set(0);
    rawMagnetY.set(0);
    rawTiltX.set(0);
    rawTiltY.set(0);
  }, [rawMagnetX, rawMagnetY, rawTiltX, rawTiltY]);

  // ── Zone handlers (magnetic zone, 48px padding outside button) ───────────────
  const handleZonePointerMove = useCallback((e: React.PointerEvent) => {
    if (isCoarse || reducedMotion || isEffectsBlocked()) return;
    if (!buttonRef.current) return;

    updateRect();
    const rect = rectRef.current;
    if (!rect) return;

    const { clientX, clientY } = e;

    // Magnetic: compute pull toward button center from within zone
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const { maxMagnetX, maxMagnetY } = personality.springs;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const halfW = rect.width / 2 + MAGNETIC_ZONE_PAD;
    const halfH = rect.height / 2 + MAGNETIC_ZONE_PAD;

    // Only apply if in magnetic zone but outside button
    const inButton =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!inButton) {
      const nx = Math.max(-1, Math.min(1, dx / halfW));
      const ny = Math.max(-1, Math.min(1, dy / halfH));
      rawMagnetX.set(nx * maxMagnetX);
      rawMagnetY.set(ny * maxMagnetY);
    }
  }, [isCoarse, reducedMotion, isEffectsBlocked, personality.springs, rawMagnetX, rawMagnetY, updateRect]);

  const handleZonePointerLeave = useCallback((_e: React.PointerEvent) => {
    if (isCoarse || reducedMotion) return;
    if (!isHoveredRef.current) {
      resetMagnetAndTilt();
      clearCSSVars();
    }
  }, [isCoarse, reducedMotion, resetMagnetAndTilt, clearCSSVars]);

  // ── Button handlers ────────────────────────────────────────────────────────
  const handleButtonPointerEnter = useCallback((_e: React.PointerEvent) => {
    if (isEffectsBlocked()) return;
    isHoveredRef.current = true;
    setState((prev) => {
      if (prev === 'idle' || prev === 'near') return 'hover';
      return prev;
    });
    // activate spotlight fade-in via CSS class (done in component)
  }, [isEffectsBlocked]);

  const handleButtonPointerMove = useCallback((e: React.PointerEvent) => {
    if (isEffectsBlocked()) return;
    if (!buttonRef.current) return;

    updateRect();
    const rect = rectRef.current;
    if (!rect) return;

    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const cx = nx - 0.5;
    const cy = ny - 0.5;

    pointerNX.set(Math.max(0, Math.min(1, nx)));
    pointerNY.set(Math.max(0, Math.min(1, ny)));

    if (!isCoarse && !reducedMotion) {
      // Magnetic pull (full range when inside button)
      const { maxMagnetX, maxMagnetY, maxTilt } = personality.springs;
      rawMagnetX.set(cx * 2 * maxMagnetX);
      rawMagnetY.set(cy * 2 * maxMagnetY);

      // Tilt
      rawTiltX.set(cy * -2 * maxTilt);
      rawTiltY.set(cx * 2 * maxTilt);

      // CSS vars for spotlight
      writeCSSVars(nx, ny);
    }
  }, [isEffectsBlocked, isCoarse, reducedMotion, personality.springs, pointerNX, pointerNY, rawMagnetX, rawMagnetY, rawTiltX, rawTiltY, updateRect, writeCSSVars]);

  const handleButtonPointerLeave = useCallback((_e: React.PointerEvent) => {
    isHoveredRef.current = false;
    if (!isEffectsBlocked()) {
      setState((prev) => (prev === 'hover' || prev === 'pressed') ? 'idle' : prev);
      resetMagnetAndTilt();
      clearCSSVars();
    }
  }, [isEffectsBlocked, resetMagnetAndTilt, clearCSSVars]);

  const handleButtonPointerDown = useCallback((_e: React.PointerEvent) => {
    if (isEffectsBlocked()) return;
    isPressedRef.current = true;
    setState((prev) => prev === 'hover' ? 'pressed' : prev);
  }, [isEffectsBlocked]);

  const handleButtonPointerUp = useCallback((_e: React.PointerEvent) => {
    isPressedRef.current = false;
    if (!isEffectsBlocked()) {
      setState((prev) => prev === 'pressed' ? 'hover' : prev);
    }
  }, [isEffectsBlocked]);

  const handleButtonPointerCancel = useCallback((_e: React.PointerEvent) => {
    isPressedRef.current = false;
    isHoveredRef.current = false;
    if (!isEffectsBlocked()) {
      setState('idle');
      resetMagnetAndTilt();
      clearCSSVars();
    }
  }, [isEffectsBlocked, resetMagnetAndTilt, clearCSSVars]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Reset on role change
  useEffect(() => {
    resetMagnetAndTilt();
    clearCSSVars();
    setState((prev) => {
      if (prev === 'hover' || prev === 'pressed' || prev === 'near') return 'idle';
      return prev;
    });
  }, [role, resetMagnetAndTilt, clearCSSVars]);

  return {
    magnetX,
    magnetY,
    tiltX,
    tiltY,
    state,
    isCoarse,
    reducedMotion,
    buttonRef,
    zoneRef,
    zoneHandlers: {
      onPointerMove: handleZonePointerMove,
      onPointerLeave: handleZonePointerLeave,
    },
    buttonHandlers: {
      onPointerEnter: handleButtonPointerEnter,
      onPointerMove: handleButtonPointerMove,
      onPointerLeave: handleButtonPointerLeave,
      onPointerDown: handleButtonPointerDown,
      onPointerUp: handleButtonPointerUp,
      onPointerCancel: handleButtonPointerCancel,
    },
    pointerNX,
    pointerNY,
  };
}
