/**
 * SpotlightCard — radial gradient cursor spotlight for hero/featured cards.
 *
 * Use ONLY for 1-3 featured cards per view (hero KPI, AI card, canteen "now serving").
 * The gradient repaints on pointer move; do not use on list items.
 *
 * The spotlight effect only activates on fine-pointer (mouse) devices
 * and is suppressed at pointer:coarse (touch) to avoid unnecessary paint.
 *
 * Usage:
 *   <SpotlightCard className="p-6 rounded-xl border ...">…</SpotlightCard>
 */
import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export const SpotlightCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, onPointerMove, ...props }, forwardedRef) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = (forwardedRef as React.RefObject<HTMLDivElement>) ?? internalRef;
  const rafId = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    // Skip touch/stylus — fine pointer only
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${clientX - r.left}px`);
      el.style.setProperty('--my', `${clientY - r.top}px`);
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      className={cn('spotlight rounded-xl', className)}
      {...props}
    >
      {children}
    </div>
  );
});

SpotlightCard.displayName = 'SpotlightCard';
