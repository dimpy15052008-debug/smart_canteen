/**
 * CampusAI Motion System — shared animation tokens, spring configs, and variants.
 * Design principle: one focal motion at a time, smooth and confident, never noisy.
 */
import type { Variants, Transition } from 'framer-motion';

// ─── Springs ─────────────────────────────────────────────────────────────────
export const SPRING_SNAPPY: Transition = { type: 'spring', stiffness: 480, damping: 30 };
export const SPRING_SOFT: Transition   = { type: 'spring', stiffness: 300, damping: 28 };
export const SPRING_BOUNCY: Transition = { type: 'spring', stiffness: 420, damping: 22 };

// ─── Easings ─────────────────────────────────────────────────────────────────
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT   = [0.4, 0, 0.2, 1] as const;

// ─── Durations (seconds) ─────────────────────────────────────────────────────
export const DUR = {
  instant:  0.09,
  micro:    0.12,
  fast:     0.18,
  standard: 0.22,
  surface:  0.32,
  hero:     0.5,
} as const;

// ─── Stagger helper ───────────────────────────────────────────────────────────
export const staggerParent = (gap = 0.04, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
  exit: { transition: { staggerChildren: gap / 2, staggerDirection: -1 } },
});

// ─── Shared element variants ─────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: DUR.standard, ease: EASE_OUT_EXPO } },
  exit:   { opacity: 0, y: -4, transition: { duration: DUR.micro, ease: 'easeIn' } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show:   { opacity: 1, scale: 1, transition: { ...SPRING_SNAPPY } },
  exit:   { opacity: 0, scale: 0.96, transition: { duration: DUR.micro } },
};

export const messageBubble: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 28 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: '100%' },
  show:   { opacity: 1, y: 0, transition: { ...SPRING_SOFT } },
  exit:   { opacity: 0, y: '100%', transition: { duration: DUR.standard, ease: EASE_IN_OUT } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: '100%' },
  show:   { opacity: 1, x: 0, transition: { ...SPRING_SOFT } },
  exit:   { opacity: 0, x: '100%', transition: { duration: DUR.standard, ease: EASE_IN_OUT } },
};

export const backdropVariant: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: DUR.standard } },
  exit:   { opacity: 0, transition: { duration: DUR.fast } },
};

export const studioCard: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 6 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 460, damping: 28 } },
  exit:   { opacity: 0, scale: 0.95, transition: { duration: DUR.micro } },
};

export const personaCard: Variants = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0, transition: { ...SPRING_SNAPPY } },
  exit:   { opacity: 0, x: 8, transition: { duration: DUR.micro } },
};

// ─── Button interaction presets ───────────────────────────────────────────────
export const BTN_HOVER = { y: -1, scale: 1.02 };
export const BTN_TAP   = { scale: 0.96 };
export const BTN_HOVER_TRANSITION: Transition = SPRING_SNAPPY;

// ─── Emotion stage colors ─────────────────────────────────────────────────────
export const EMOTION_COLORS = {
  idle:      { glow: '#06b6d4', ring: '#22d3ee', particle: '#67e8f9' },
  listening: { glow: '#f43f5e', ring: '#fb7185', particle: '#fda4af' },
  thinking:  { glow: '#f59e0b', ring: '#fbbf24', particle: '#fde68a' },
  speaking:  { glow: '#6366f1', ring: '#818cf8', particle: '#c7d2fe' },
  success:   { glow: '#10b981', ring: '#34d399', particle: '#6ee7b7' },
  alert:     { glow: '#f59e0b', ring: '#fbbf24', particle: '#fde68a' },
} as const;

export type AvatarStateKey = keyof typeof EMOTION_COLORS;
