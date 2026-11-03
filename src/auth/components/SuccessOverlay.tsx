import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { UserRole } from '../../types';
import { ROLE_THEMES, EASE } from '../motion/tokens';
import { SmartUniLogo } from '../../components/common/SmartUniLogo';
import { usePrefersReducedMotion } from '../motion/hooks';

interface SuccessOverlayProps {
  role: UserRole;
  isActive: boolean;
  onComplete: () => void;
}

export const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
  role,
  isActive,
  onComplete,
}) => {
  const prefersReduced = usePrefersReducedMotion();
  const theme = ROLE_THEMES[role] || ROLE_THEMES.student;

  useEffect(() => {
    if (!isActive) return;

    // 1. Confetti burst (disabled on reduced motion)
    if (!prefersReduced) {
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6, x: 0.7 },
          colors: [theme.accent, theme.accent2, '#ffffff', '#38bdf8'],
          disableForReducedMotion: true,
        });
      } catch (err) {
        // fallback safe
      }
    }

    // 2. Timer to complete navigation (1.4s)
    const timer = setTimeout(() => {
      onComplete();
    }, prefersReduced ? 400 : 1350);

    return () => clearTimeout(timer);
  }, [isActive, onComplete, prefersReduced, theme]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        onClick={onComplete}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 cursor-pointer select-none bg-slate-950/90 backdrop-blur-xl"
      >
        {/* Expanding Circular Ripple / Radial Fill in Role Accent */}
        {!prefersReduced && (
          <motion.div
            className="absolute rounded-full pointer-events-none -z-10"
            style={{
              background: `radial-gradient(circle, ${theme.accent} 0%, ${theme.accent2} 50%, transparent 75%)`,
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: '220vmax', height: '220vmax', opacity: 0.22 }}
            transition={{ duration: 1.2, ease: EASE.expoOut }}
          />
        )}

        {/* Center Content: Logo + Welcome Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: EASE.expoOut }}
          className="flex flex-col items-center space-y-6 text-center max-w-sm"
        >
          <div className="relative">
            <SmartUniLogo variant="icon" height={72} className="drop-shadow-2xl" />
            <motion.div
              className="absolute -inset-4 rounded-full blur-xl -z-10"
              style={{ backgroundColor: theme.accent }}
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-2xl font-bold text-white tracking-tight"
            >
              Welcome back, {theme.label}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="text-xs text-slate-400"
            >
              Redirecting to your institutional portal...
            </motion.p>
          </div>

          {/* Progress loader */}
          <motion.div
            className="w-48 h-1 rounded-full bg-slate-800 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: theme.accent }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
