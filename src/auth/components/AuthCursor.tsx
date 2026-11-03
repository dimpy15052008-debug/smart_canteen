/**
 * AuthCursor.tsx
 * Global fixed-position follower ring for the auth page.
 * Lives in ONE layer, pointer-events: none, unmounts on route change.
 * Morphs between ring / hover / pressed / loading states per role.
 * Only rendered on fine-pointer desktop devices.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { useMotionValue, useSpring, motion, animate } from 'framer-motion';
import type { UserRole } from '../../types';
import type { CursorGlyph } from '../motion/rolePersonalities';
import { ROLE_PERSONALITIES } from '../motion/rolePersonalities';
import { ROLE_THEMES } from '../motion/tokens';

export type CursorState = 'idle' | 'hover' | 'pressed' | 'loading';

interface AuthCursorProps {
  role: UserRole;
  cursorState: CursorState;
}

// ── Glyphs as tiny inline SVGs ────────────────────────────────────────────────
const SparkleGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0 L9 6 L15 8 L9 10 L8 16 L7 10 L1 8 L7 6 Z" />
  </svg>
);

const TickGlyph: React.FC<{ size: number; drawn: boolean }> = ({ size, drawn }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path
      d="M2 8 L6 12 L14 4"
      strokeDasharray="20"
      strokeDashoffset={drawn ? 0 : 20}
      style={{ transition: 'stroke-dashoffset 300ms ease' }}
    />
  </svg>
);

const LockGlyph: React.FC<{ unlocked: boolean }> = ({ unlocked }) => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
    {/* Shackle */}
    <path
      d="M2.5 5V3.5 C2.5 1.8 7.5 1.8 7.5 3.5 V5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      style={{
        transform: unlocked ? 'translateY(-3px)' : 'none',
        transition: 'transform 200ms ease',
      }}
    />
    {/* Body */}
    <rect x="1" y="5" width="8" height="6" rx="1.5" />
    {/* Keyhole */}
    <circle cx="5" cy="7.5" r="1" fill="rgba(0,0,0,0.4)" />
    <rect x="4.5" y="8" width="1" height="1.5" rx="0.5" fill="rgba(0,0,0,0.4)" />
  </svg>
);

const FlameGlyph: React.FC<{ flicker: boolean }> = ({ flicker }) => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
    <path
      d="M5 0 C5 0 8 4 8 7 C8 9.2 6.7 11 5 11 C3.3 11 2 9.2 2 7 C2 5 4 3 4 3 C4 5 5.5 6 5.5 7.5 C5.5 8.3 5 9 5 9 C5 9 6 8 6 7 C6 5 5 0 5 0Z"
      style={{
        animation: flicker ? 'ember-flicker 0.4s ease-in-out infinite alternate' : 'none',
      }}
    />
  </svg>
);

// ── Sizes per cursor state ────────────────────────────────────────────────────
const RING_SIZES: Record<CursorState, number> = {
  idle: 24,
  hover: 56,
  pressed: 18,
  loading: 24,
};

function GlyphForRole({
  glyph,
  cursorState,
  isHover,
}: {
  glyph: CursorGlyph;
  cursorState: CursorState;
  isHover: boolean;
}) {
  switch (glyph) {
    case 'sparkle':
      return cursorState === 'hover' ? <SparkleGlyph size={14} /> : null;
    case 'tick':
      return cursorState === 'hover' ? <TickGlyph size={14} drawn={isHover} /> : null;
    case 'lock':
      return cursorState === 'hover' || cursorState === 'pressed'
        ? <LockGlyph unlocked={cursorState === 'hover'} />
        : null;
    case 'flame':
      return cursorState === 'hover'
        ? <FlameGlyph flicker={true} />
        : null;
    default:
      return null;
  }
}

// Orbiting dot for loading state
function OrbitingDot({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ background: color, top: '50%', left: '50%', marginTop: -4, marginLeft: -4 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: color,
          top: -14,
          left: 0,
        }}
      />
    </motion.div>
  );
}

export const AuthCursor: React.FC<AuthCursorProps> = ({ role, cursorState }) => {
  const personality = ROLE_PERSONALITIES[role];
  const theme = ROLE_THEMES[role];
  const color = theme.accent;

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const springX = useSpring(rawX, personality.springs.ring);
  const springY = useSpring(rawY, personality.springs.ring);

  const ringSize = RING_SIZES[cursorState];
  const isFilled = cursorState === 'pressed';
  const showContent = cursorState === 'hover' || cursorState === 'pressed';

  // Track global pointer
  const handlePointerMove = useCallback((e: PointerEvent) => {
    rawX.set(e.clientX);
    rawY.set(e.clientY);
  }, [rawX, rawY]);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [handlePointerMove]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      aria-hidden="true"
    >
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        animate={{
          width: ringSize,
          height: ringSize,
          backgroundColor: isFilled ? color : 'transparent',
          borderColor: color,
          borderWidth: isFilled ? 0 : 1.5,
          opacity: cursorState === 'idle' ? 0.5 : 0.9,
        }}
        transition={{
          width: { type: 'spring', stiffness: 300, damping: 28 },
          height: { type: 'spring', stiffness: 300, damping: 28 },
          backgroundColor: { duration: 0.15 },
          borderWidth: { duration: 0.1 },
          opacity: { duration: 0.2 },
        }}
        style={{
          color: cursorState === 'hover' ? '#fff' : color,
          mixBlendMode: 'screen',
          borderStyle: 'solid',
          boxShadow: isFilled ? `0 0 12px ${color}88` : 'none',
        }}
      >
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <GlyphForRole
              glyph={personality.cursorGlyph}
              cursorState={cursorState}
              isHover={cursorState === 'hover'}
            />
          </motion.div>
        )}
        {cursorState === 'loading' && <OrbitingDot color={color} />}
      </motion.div>
    </motion.div>
  );
};
