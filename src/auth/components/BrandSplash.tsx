import React from 'react';
import { motion } from 'framer-motion';
import { SmartUniLogo } from '../../components/common/SmartUniLogo';
import { EASE } from '../motion/tokens';

interface BrandSplashProps {
  message?: string;
  className?: string;
}

export const BrandSplash: React.FC<BrandSplashProps> = ({
  message = 'Initializing Secure Campus Session...',
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Background Soft Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Center Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE.expoOut }}
        className="flex flex-col items-center space-y-7 relative z-10 max-w-sm w-full text-center"
      >
        {/* Logo with pulsing ring */}
        <div className="relative flex items-center justify-center">
          <SmartUniLogo variant="icon" height={80} className="drop-shadow-xl" />

          {/* Soft pulsing ring */}
          <motion.div
            className="absolute -inset-3 rounded-full border border-indigo-500/30 pointer-events-none"
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -inset-6 rounded-full border border-violet-500/20 pointer-events-none"
            animate={{ scale: [1, 1.35, 1], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white tracking-tight">SmartUni.Ai</h3>
          <p className="text-xs text-slate-400">{message}</p>
        </div>

        {/* Thin Animated Progress Line */}
        <div className="w-52 h-[2px] rounded-full bg-slate-800/80 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-400 to-cyan-400 rounded-full"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ width: '60%' }}
          />
        </div>
      </motion.div>
    </div>
  );
};
