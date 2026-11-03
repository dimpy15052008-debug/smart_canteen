/**
 * rolePersonalities.ts
 * Typed per-role configuration for the cursor-driven interaction system.
 */
import type { Transition } from 'framer-motion';
import type { UserRole } from '../../types';

export interface RoleSpring {
  magnet: Transition;
  tilt: Transition;
  ring: Transition;
  maxMagnetX: number;
  maxMagnetY: number;
  maxTilt: number;
}

export type ParticleKind = 'sparkle' | 'ember' | 'none';

export interface ParticleConfig {
  kind: ParticleKind;
  maxAlive: number;
  lifespanMs: number;
}

export type RippleStyle = 'constellation' | 'single-echo' | 'shield-pulse' | 'warm-burst';
export type CursorGlyph = 'sparkle' | 'tick' | 'lock' | 'flame';

export interface RolePersonality {
  springs: RoleSpring;
  particles: ParticleConfig;
  rippleStyle: RippleStyle;
  cursorGlyph: CursorGlyph;
  hasScanLine: boolean;
  hasSteam: boolean;
  spotlightEdge: number;
  personality: string;
}

export const ROLE_PERSONALITIES: Record<UserRole, RolePersonality> = {
  student: {
    springs: {
      magnet:    { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 },
      tilt:      { type: 'spring', stiffness: 160, damping: 18, mass: 0.1 },
      ring:      { type: 'spring', stiffness: 220, damping: 22, mass: 0.15 },
      maxMagnetX: 8, maxMagnetY: 5, maxTilt: 5,
    },
    particles: { kind: 'sparkle', maxAlive: 12, lifespanMs: 700 },
    rippleStyle: 'constellation',
    cursorGlyph: 'sparkle',
    hasScanLine: false, hasSteam: false, spotlightEdge: 0,
    personality: 'intelligent and curious',
  },
  faculty: {
    springs: {
      magnet:    { type: 'spring', stiffness: 160, damping: 18, mass: 0.1 },
      tilt:      { type: 'spring', stiffness: 180, damping: 22, mass: 0.1 },
      ring:      { type: 'spring', stiffness: 260, damping: 26, mass: 0.12 },
      maxMagnetX: 8, maxMagnetY: 5, maxTilt: 5,
    },
    particles: { kind: 'none', maxAlive: 0, lifespanMs: 0 },
    rippleStyle: 'single-echo',
    cursorGlyph: 'tick',
    hasScanLine: false, hasSteam: false, spotlightEdge: 0.6,
    personality: 'precise and trustworthy',
  },
  admin: {
    springs: {
      magnet:    { type: 'spring', stiffness: 130, damping: 20, mass: 0.15 },
      tilt:      { type: 'spring', stiffness: 140, damping: 22, mass: 0.15 },
      ring:      { type: 'spring', stiffness: 180, damping: 24, mass: 0.2 },
      maxMagnetX: 8, maxMagnetY: 5, maxTilt: 3.5,
    },
    particles: { kind: 'none', maxAlive: 0, lifespanMs: 0 },
    rippleStyle: 'shield-pulse',
    cursorGlyph: 'lock',
    hasScanLine: true, hasSteam: false, spotlightEdge: 0.3,
    personality: 'secure and authoritative',
  },
  canteen: {
    springs: {
      magnet:    { type: 'spring', stiffness: 160, damping: 12, mass: 0.08 },
      tilt:      { type: 'spring', stiffness: 180, damping: 12, mass: 0.08 },
      ring:      { type: 'spring', stiffness: 240, damping: 14, mass: 0.1 },
      maxMagnetX: 8, maxMagnetY: 5, maxTilt: 5,
    },
    particles: { kind: 'ember', maxAlive: 14, lifespanMs: 900 },
    rippleStyle: 'warm-burst',
    cursorGlyph: 'flame',
    hasScanLine: false, hasSteam: true, spotlightEdge: 0,
    personality: 'warm and energetic',
  },
} as const;
