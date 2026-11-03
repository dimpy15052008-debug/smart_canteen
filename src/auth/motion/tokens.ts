/**
 * Auth Motion Tokens — Campus Aurora Cinematic Tier
 * 
 * Extends the base motion system (src/lib/motion.ts) with auth-specific
 * tokens: role themes with CSS variable names, cinematic durations,
 * and specialized springs for the login experience.
 */
import type { Transition } from 'framer-motion';
import type { UserRole } from '../../types';

// ─── Easings ─────────────────────────────────────────────────────────────────
export const EASE = {
  expoOut:    [0.16, 1, 0.3, 1]   as [number, number, number, number],
  smooth:     [0.4, 0, 0.2, 1]    as [number, number, number, number],
  anticipate: [0.36, 0, 0.66, -0.56] as [number, number, number, number],
} as const;

// ─── Durations (seconds) ─────────────────────────────────────────────────────
export const DUR = {
  micro:     0.12,
  standard:  0.22,
  surface:   0.4,
  cinematic: 0.8,
  ambient:   12,
} as const;

// ─── Springs ─────────────────────────────────────────────────────────────────
export const SPRING = {
  snappy:   { type: 'spring', stiffness: 500, damping: 32 } as Transition,
  soft:     { type: 'spring', stiffness: 220, damping: 24 } as Transition,
  magnetic: { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as Transition,
} as const;

// ─── Stagger ─────────────────────────────────────────────────────────────────
export const STAGGER = {
  fast: 0.06,
  normal: 0.08,
  slow: 0.12,
} as const;

// ─── Role Themes ─────────────────────────────────────────────────────────────
export interface RoleTheme {
  accent:  string;  // Primary accent (CSS color)
  accent2: string;  // Secondary accent
  glow:    string;  // Glow color with alpha
  label:   string;
}

export const ROLE_THEMES: Record<UserRole, RoleTheme> = {
  student: {
    accent:  '#6366f1',
    accent2: '#8b5cf6',
    glow:    'rgba(99, 102, 241, 0.35)',
    label:   'Student',
  },
  faculty: {
    accent:  '#10b981',
    accent2: '#14b8a6',
    glow:    'rgba(16, 185, 129, 0.35)',
    label:   'Faculty',
  },
  admin: {
    accent:  '#f59e0b',
    accent2: '#fbbf24',
    glow:    'rgba(245, 158, 11, 0.35)',
    label:   'Admin',
  },
  canteen: {
    accent:  '#f97316',
    accent2: '#fb7185',
    glow:    'rgba(249, 115, 22, 0.35)',
    label:   'Canteen',
  },
} as const;

/**
 * Returns CSS custom property overrides for the current role.
 * Apply these as `style` on the root auth container so every
 * child reads `var(--role-accent)` etc.
 */
export function roleVars(role: UserRole): React.CSSProperties {
  const t = ROLE_THEMES[role];
  return {
    '--role-accent':  t.accent,
    '--role-accent2': t.accent2,
    '--role-glow':    t.glow,
  } as React.CSSProperties;
}

// ─── Role-specific content ───────────────────────────────────────────────────
export const ROLE_SCENES: Record<UserRole, {
  badge: string;
  headline: string;
  headlineAccent: string;
  description: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
}> = {
  student: {
    badge: 'Unified Institutional Platform',
    headline: 'One Login.',
    headlineAccent: 'Four Specialized Portals.',
    description: 'Experience seamless role-based workflows for Students, Faculty, Administration, and Canteen staff backed by predictive AI intelligence.',
    feature1Title: '3D Campus AI Companion',
    feature1Desc: 'Gemini-powered multimodal tool execution loop & instant assistant.',
    feature2Title: 'Smart Attendance System',
    feature2Desc: 'Face-recognition biometrics with geo-fencing & live session tracking.',
  },
  faculty: {
    badge: 'Faculty Command Center',
    headline: 'One Tap.',
    headlineAccent: 'Complete Session Control.',
    description: 'Launch attendance sessions, review analytics and manage student requests — all from a unified faculty workspace.',
    feature1Title: 'One-Tap Attendance Sessions',
    feature1Desc: 'Launch biometric sessions with live student check-in dashboards.',
    feature2Title: 'Request & Approval Queue',
    feature2Desc: 'Review student applications, leave requests, and grade disputes.',
  },
  admin: {
    badge: 'Governance & Analytics',
    headline: 'Full Visibility.',
    headlineAccent: 'Zero Blind Spots.',
    description: 'Monitor institution-wide analytics, manage roles with RLS policies, and oversee every department from a single command center.',
    feature1Title: 'Real-time Analytics Dashboard',
    feature1Desc: 'Cross-department KPIs, enrollment funnels, and attendance heat maps.',
    feature2Title: 'Governance & RLS Audit',
    feature2Desc: 'Row-level security policies, access logs, and compliance reports.',
  },
  canteen: {
    badge: 'Kitchen Operations Terminal',
    headline: 'Live Orders.',
    headlineAccent: 'Instant QR Pickup.',
    description: 'Manage kitchen order tickets in real-time, handle QR-based pickup flows, and track menu analytics — all on one screen.',
    feature1Title: 'Live KOT Queue Desk',
    feature1Desc: 'Real-time kitchen order tickets with priority and status tracking.',
    feature2Title: 'QR Pickup Token System',
    feature2Desc: 'Students scan QR codes for verified food pickup — zero queues.',
  },
};

// Tab index map for directional transitions
export const ROLE_ORDER: UserRole[] = ['student', 'faculty', 'admin', 'canteen'];
export const getRoleIndex = (role: UserRole): number => ROLE_ORDER.indexOf(role);
