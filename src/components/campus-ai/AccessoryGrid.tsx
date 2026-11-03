/**
 * AccessoryGrid — quick accessory toggle group.
 *
 * Provides animated toggles for avatar accessories (DJ Headphones, Shades).
 * Can be embedded in StudioSheet or floating inspectors.
 */
import React, { memo } from 'react';
import { Headphones } from 'lucide-react';
import { MotionButton } from './MotionButton';

export interface AccessoryGridProps {
  wearHeadphones: boolean;
  wearSunglasses: boolean;
  onToggleHeadphones: () => void;
  onToggleSunglasses: () => void;
  className?: string;
}

export const AccessoryGrid = memo(function AccessoryGrid({
  wearHeadphones,
  wearSunglasses,
  onToggleHeadphones,
  onToggleSunglasses,
  className = '',
}: AccessoryGridProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label="Avatar accessories">
      <MotionButton
        onClick={onToggleHeadphones}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
          wearHeadphones
            ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={wearHeadphones}
        aria-label="Toggle DJ headphones"
      >
        <Headphones className="w-3.5 h-3.5" />
        <span>Headphones</span>
      </MotionButton>

      <MotionButton
        onClick={onToggleSunglasses}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
          wearSunglasses
            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={wearSunglasses}
        aria-label="Toggle sunglasses"
      >
        <span>🕶️</span>
        <span>Sunglasses</span>
      </MotionButton>
    </div>
  );
});
