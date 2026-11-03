/**
 * Campus Aurora Motion System — src/lib/motion.ts
 * Single source of truth for all animation tokens.
 * Re-exported from hooks/useMotionPreset for backward compatibility.
 */
import type { Transition, Variants } from 'framer-motion';

// ─── Easing ──────────────────────────────────────────────────────────────────
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// ─── Duration (in seconds for framer, ms note in comment) ────────────────────
export const DUR = {
  instant: 0.09,   // 90 ms  — hover colour, press feedback
  micro:   0.12,   // 120 ms — toggles, icon swaps, tooltips
  standard: 0.2,   // 200 ms — dropdowns, tabs, card hover
  surface:  0.32,  // 320 ms — route enter, drawers, modals
  hero:     0.6,   // 600 ms — login, onboarding, celebrations only
} as const;

// ─── Springs ─────────────────────────────────────────────────────────────────
export const SPRING = {
  snappy: { type: 'spring', stiffness: 500, damping: 32 },
  soft:   { type: 'spring', stiffness: 260, damping: 26 },
  bouncy: { type: 'spring', stiffness: 380, damping: 18 },
} as const satisfies Record<string, Transition>;

// ─── Shared Variants ─────────────────────────────────────────────────────────

/** Fade up 12 px — primary entrance variant for cards, rows, sections */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.surface, ease: EASE_OUT },
  },
};

/** Scale + fade — for modals, badges, pills */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: DUR.standard, ease: EASE_OUT },
  },
};

/** Fade only — for overlays/backdrops, reduced-motion substitutes */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: DUR.standard, ease: EASE_OUT },
  },
};

/**
 * Parent stagger variant. Children use fadeUp / popIn / etc.
 * @param gap  Seconds between each child's start (default 0.05 = 50 ms)
 * @param delay Initial delay before first child (default 0)
 */
export const stagger = (gap = 0.05, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/**
 * Per-item delay capped so total stagger never exceeds ~400 ms.
 * @param index  Item index in the list
 * @param gap    Seconds between items (default 0.05)
 * @param maxItems After this index, everyone gets the same delay (default 8)
 */
export const cappedDelay = (index: number, gap = 0.05, maxItems = 8): number =>
  Math.min(index, maxItems) * gap;

// ─── Slide variants (for drawers / bottom sheets) ────────────────────────────
export const slideRight: Variants = {
  hidden: { opacity: 0, x: '100%' },
  show: { opacity: 1, x: 0, transition: { ...SPRING.soft } },
  exit: { opacity: 0, x: '100%', transition: { duration: DUR.standard, ease: EASE_OUT } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: '100%' },
  show: { opacity: 1, y: 0, transition: { ...SPRING.soft } },
  exit: { opacity: 0, y: '100%', transition: { duration: DUR.standard, ease: EASE_OUT } },
};

// ─── Modal variants ───────────────────────────────────────────────────────────
export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DUR.surface, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: 0.14, ease: 'easeIn' },
  },
};

export const backdropVariant: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.standard } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};
