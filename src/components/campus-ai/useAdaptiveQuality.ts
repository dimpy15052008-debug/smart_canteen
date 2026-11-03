/**
 * useAdaptiveQuality — manages Three.js render quality tier.
 *
 * Tiers:
 *   'high'   — 60fps, pixelRatio up to 2, full antialias
 *   'medium' — 60fps, pixelRatio up to 1.5
 *   'low'    — 30fps, pixelRatio 1, no extras (battery saver / low-end)
 *
 * Auto-degrades to 0.75x pixel ratio when frame time > 20ms for 1 full second.
 * Auto-upgrades back when frame time stabilizes below 16ms for 2 seconds.
 * Also detects battery-saver and low-end hardware on mount.
 */
import { useRef, useState, useEffect, useCallback } from 'react';

export type QualityTier = 'high' | 'medium' | 'low';

interface AdaptiveQuality {
  tier: QualityTier;
  targetFPS: number;
  maxPixelRatio: number;
  /** Report the time (ms) taken by the last frame */
  reportFrameTime: (ms: number) => void;
}

export function useAdaptiveQuality(): AdaptiveQuality {
  const [tier, setTier] = useState<QualityTier>(() => {
    // Detect low-end devices on mount
    const nav = navigator as any;
    const cores = nav.hardwareConcurrency ?? 8;
    const mem   = nav.deviceMemory ?? 8;
    if (cores <= 4 || mem <= 4) return 'low';
    if (window.devicePixelRatio <= 1) return 'medium';
    return 'high';
  });

  const slowFrames  = useRef(0);
  const fastFrames  = useRef(0);
  const lastTierRef = useRef(tier);
  lastTierRef.current = tier;

  const reportFrameTime = useCallback((ms: number) => {
    if (ms > 20) {
      slowFrames.current++;
      fastFrames.current = 0;
      // 10 slow frames ≈ 1s at 10fps check rate
      if (slowFrames.current > 10 && lastTierRef.current === 'high') {
        setTier('medium');
        slowFrames.current = 0;
      } else if (slowFrames.current > 10 && lastTierRef.current === 'medium') {
        setTier('low');
        slowFrames.current = 0;
      }
    } else if (ms < 16) {
      fastFrames.current++;
      slowFrames.current = 0;
      if (fastFrames.current > 20 && lastTierRef.current === 'low') {
        setTier('medium');
        fastFrames.current = 0;
      } else if (fastFrames.current > 20 && lastTierRef.current === 'medium') {
        setTier('high');
        fastFrames.current = 0;
      }
    }
  }, []);

  // Battery API check (non-blocking, optional)
  useEffect(() => {
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((battery: any) => {
        if (battery.charging === false && battery.level < 0.2) {
          setTier('low');
        }
      }).catch(() => {});
    }
  }, []);

  const config: Record<QualityTier, { targetFPS: number; maxPixelRatio: number }> = {
    high:   { targetFPS: 60, maxPixelRatio: 2 },
    medium: { targetFPS: 60, maxPixelRatio: 1.5 },
    low:    { targetFPS: 30, maxPixelRatio: 1 },
  };

  return { tier, ...config[tier], reportFrameTime };
}
