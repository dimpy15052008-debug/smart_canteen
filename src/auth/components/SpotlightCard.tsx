import React, { useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { SPRING } from '../motion/tokens';
import { usePrefersReducedMotion } from '../motion/hooks';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  showConicDraw?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  maxTilt = 3,
  showConicDraw = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  // 3D Tilt Motion Values
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springRotX = useSpring(rotX, SPRING.soft);
  const springRotY = useSpring(rotY, SPRING.soft);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.setProperty('--mx', `${x}px`);
          cardRef.current.style.setProperty('--my', `${y}px`);
        }
      });

      // Compute 3D tilt if not touch / not reduced
      const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      if (!isTouch && !prefersReduced) {
        const normX = x / rect.width - 0.5;
        const normY = y / rect.height - 0.5;
        rotY.set(normX * maxTilt * 2);
        rotX.set(-normY * maxTilt * 2);
      }
    },
    [maxTilt, prefersReduced, rotX, rotY]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (cardRef.current) {
      cardRef.current.style.removeProperty('--mx');
      cardRef.current.style.removeProperty('--my');
    }
    rotX.set(0);
    rotY.set(0);
  }, [rotX, rotY]);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotX,
        rotateY: springRotY,
        transformStyle: 'preserve-3d',
      }}
      className={`group relative rounded-3xl bg-slate-900/75 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl transition-all duration-300 ${className}`}
      {...(props as any)}
    >
      {/* 1. Conic Light Sweep Border Draw (Entrance effect) */}
      {showConicDraw && !prefersReduced && (
        <div
          className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-40 z-0 overflow-hidden"
          style={{
            background:
              'conic-gradient(from var(--conic-angle, 0deg) at 50% 50%, transparent 70%, var(--role-accent, #6366f1) 85%, var(--role-accent2, #8b5cf6) 95%, transparent 100%)',
            animation: 'conic-spin 4s linear 1 forwards',
          }}
        />
      )}

      {/* 2. Idle Breathing Border Glow */}
      <div
        className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity duration-500 -z-10"
        style={{
          boxShadow: '0 0 35px -5px var(--role-glow, rgba(99,102,241,0.25))',
        }}
      />

      {/* 3. Cursor Spotlight Radial Glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"
        style={{
          background:
            'radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), var(--role-glow, rgba(99,102,241,0.18)), transparent 65%)',
        }}
      />

      {/* 4. Specular Sheen across surface */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/5 to-transparent"
        style={{
          transform: 'translateZ(10px)',
        }}
      />

      {/* Children content rendered safely above overlays */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
