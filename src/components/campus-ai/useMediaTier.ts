/**
 * useMediaTier — returns the current viewport size tier.
 * Used to drive adaptive layout decisions across CampusAI components.
 */
import { useState, useEffect } from 'react';

export type MediaTier = 'mobile' | 'tablet' | 'laptop' | 'desktop';

function getTier(width: number): MediaTier {
  if (width < 640)  return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'laptop';
  return 'desktop';
}

export function useMediaTier(): MediaTier {
  const [tier, setTier] = useState<MediaTier>(() => getTier(window.innerWidth));

  useEffect(() => {
    const mqs = [
      window.matchMedia('(max-width: 639px)'),
      window.matchMedia('(min-width: 640px) and (max-width: 1023px)'),
      window.matchMedia('(min-width: 1024px) and (max-width: 1439px)'),
      window.matchMedia('(min-width: 1440px)'),
    ];
    const handler = () => setTier(getTier(window.innerWidth));
    mqs.forEach(mq => mq.addEventListener('change', handler));
    return () => mqs.forEach(mq => mq.removeEventListener('change', handler));
  }, []);

  return tier;
}

export function useIsMobile(): boolean {
  return useMediaTier() === 'mobile';
}
