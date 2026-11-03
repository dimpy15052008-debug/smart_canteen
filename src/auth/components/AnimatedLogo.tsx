import React from 'react';
import { motion } from 'framer-motion';
import { SmartUniLogo, type SmartUniLogoProps } from '../../components/common/SmartUniLogo';
import { EASE } from '../motion/tokens';

interface AnimatedLogoProps extends SmartUniLogoProps {
  animateIntro?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  variant = 'full',
  height,
  showTagline = true,
  className = '',
  animateIntro = true,
}) => {
  if (!animateIntro) {
    return (
      <SmartUniLogo
        variant={variant}
        height={height}
        showTagline={showTagline}
        className={className}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease: EASE.expoOut }}
      className={`relative inline-block ${className}`}
    >
      <SmartUniLogo
        variant={variant}
        height={height}
        showTagline={showTagline}
        className="relative z-10"
      />
      {/* Soft Logo Ambient Glow Pulse */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none -z-0 opacity-40 blur-xl"
        style={{
          background: 'radial-gradient(circle, var(--role-glow, rgba(99,102,241,0.4)) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};
