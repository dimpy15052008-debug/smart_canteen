/**
 * Ripple.tsx
 * Pooled ripple effect component. Renders a ripple from an exact click point.
 * Each ripple is removed from DOM after its animation completes.
 * Supports four visual styles driven by the role personality.
 */
import React, { useEffect, useRef } from 'react';
import type { RippleStyle } from '../motion/rolePersonalities';

export interface RippleData {
  id: number;
  x: number;
  y: number;
  color: string;
  style: RippleStyle;
}

interface RippleProps {
  ripple: RippleData;
  onDone: (id: number) => void;
}

const RIPPLE_DURATION_MS = 600;
const CONSTELLATION_DOT_COUNT = 5;

function ConstellationRipple({ x, y, color }: { x: number; y: number; color: string }) {
  const dots = Array.from({ length: CONSTELLATION_DOT_COUNT }, (_, i) => {
    const angle = (i / CONSTELLATION_DOT_COUNT) * 2 * Math.PI;
    return { angle, delay: i * 40 };
  });
  return (
    <>
      {/* Base expanding ring */}
      <span
        className="absolute rounded-full pointer-events-none"
        style={{
          left: x, top: y,
          width: 120, height: 120,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
          animation: `constellation-ripple ${RIPPLE_DURATION_MS}ms cubic-bezier(0.2, 0, 0.8, 1) forwards`,
        }}
      />
      {/* Constellation dots */}
      {dots.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: x, top: y,
            width: 4, height: 4,
            background: color,
            opacity: 0.8,
            animation: `constellation-dot ${RIPPLE_DURATION_MS}ms ${dot.delay}ms cubic-bezier(0.2, 0, 1, 1) forwards`,
            '--dot-angle': `${dot.angle}rad`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

function SingleEchoRipple({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <>
      <span
        className="absolute rounded-full pointer-events-none"
        style={{
          left: x, top: y,
          width: 100, height: 100,
          transform: 'translate(-50%, -50%)',
          border: `1.5px solid ${color}`,
          animation: `single-echo-1 ${RIPPLE_DURATION_MS}ms cubic-bezier(0.2, 0, 0.8, 1) forwards`,
        }}
      />
      <span
        className="absolute rounded-full pointer-events-none"
        style={{
          left: x, top: y,
          width: 100, height: 100,
          transform: 'translate(-50%, -50%)',
          border: `1px solid ${color}88`,
          animation: `single-echo-2 ${RIPPLE_DURATION_MS}ms 80ms cubic-bezier(0.2, 0, 0.8, 1) forwards`,
        }}
      />
    </>
  );
}

function ShieldPulseRipple({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: x, top: y,
            width: 80, height: 80,
            transform: 'translate(-50%, -50%)',
            border: `1px solid ${color}${i === 0 ? 'cc' : i === 1 ? '66' : '33'}`,
            animation: `shield-pulse ${RIPPLE_DURATION_MS}ms ${i * 100}ms cubic-bezier(0.2, 0, 0.8, 1) forwards`,
          }}
        />
      ))}
    </>
  );
}

function WarmBurstRipple({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <span
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: 130, height: 130,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${color}40 0%, ${color}15 40%, transparent 70%)`,
        animation: `warm-burst ${RIPPLE_DURATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
      }}
    />
  );
}

export const RippleEffect: React.FC<RippleProps> = ({ ripple, onDone }) => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      onDone(ripple.id);
    }, RIPPLE_DURATION_MS + 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ripple.id, onDone]);

  const { x, y, color, style } = ripple;

  switch (style) {
    case 'constellation':
      return <ConstellationRipple x={x} y={y} color={color} />;
    case 'single-echo':
      return <SingleEchoRipple x={x} y={y} color={color} />;
    case 'shield-pulse':
      return <ShieldPulseRipple x={x} y={y} color={color} />;
    case 'warm-burst':
      return <WarmBurstRipple x={x} y={y} color={color} />;
    default:
      return null;
  }
};
