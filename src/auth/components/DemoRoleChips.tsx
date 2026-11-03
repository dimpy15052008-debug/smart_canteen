import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, UserCheck, Building2, Utensils, Lock } from 'lucide-react';
import { UserRole } from '../../types';
import { ROLE_THEMES, EASE } from '../motion/tokens';
import { usePrefersReducedMotion } from '../motion/hooks';

interface DemoRoleChipsProps {
  onSelectRole: (role: UserRole) => Promise<void>;
  disabled?: boolean;
}

const CHIP_CONFIG = [
  {
    role: 'student' as UserRole,
    label: 'Student Portal',
    icon: GraduationCap,
  },
  {
    role: 'faculty' as UserRole,
    label: 'Faculty Portal',
    icon: UserCheck,
  },
  {
    role: 'admin' as UserRole,
    label: 'Admin Portal',
    icon: Building2,
  },
  {
    role: 'canteen' as UserRole,
    label: 'Canteen Portal',
    icon: Utensils,
  },
];

export const DemoRoleChips: React.FC<DemoRoleChipsProps> = ({
  onSelectRole,
  disabled = false,
}) => {
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  const handleChipClick = async (role: UserRole) => {
    if (disabled || loadingRole) return;
    setLoadingRole(role);
    try {
      await onSelectRole(role);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <div className="flex items-center gap-2">
          <motion.div
            animate={prefersReduced ? undefined : { rotate: [0, -10, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
          </motion.div>
          <span>Quick Demo Role Logins</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Dev Mode</span>
      </div>

      <p className="text-[11px] text-slate-400 leading-tight">
        Click any chip below to instantly test the portal as that role:
      </p>

      {/* Grid of Chips */}
      <div className="grid grid-cols-2 gap-2">
        {CHIP_CONFIG.map((chip, i) => {
          const ChipIcon = chip.icon;
          const theme = ROLE_THEMES[chip.role];
          const isLoading = loadingRole === chip.role;
          const isOtherLoading = loadingRole !== null && !isLoading;

          return (
            <motion.button
              key={chip.role}
              type="button"
              disabled={disabled || loadingRole !== null}
              onClick={() => handleChipClick(chip.role)}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: isOtherLoading ? 0.35 : 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: EASE.expoOut }}
              whileHover={
                prefersReduced || disabled || loadingRole !== null
                  ? undefined
                  : { scale: 1.03, y: -2 }
              }
              whileTap={
                prefersReduced || disabled || loadingRole !== null
                  ? undefined
                  : { scale: 0.97 }
              }
              className="relative px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 text-white bg-slate-950/70 border-slate-800 hover:border-slate-700 transition-all select-none outline-none focus-visible:ring-1 focus-visible:ring-white overflow-hidden group"
              style={{
                boxShadow: `0 0 0 1px transparent`,
              }}
            >
              {/* Colored Glow overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none rounded-xl"
                style={{ backgroundColor: theme.accent }}
              />

              {/* Icon or Loading micro-spinner */}
              {isLoading ? (
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin shrink-0"
                  style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
                />
              ) : (
                <motion.div
                  className="shrink-0"
                  whileHover={prefersReduced ? undefined : { scale: 1.15 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChipIcon className="w-4 h-4" style={{ color: theme.accent }} />
                </motion.div>
              )}

              <span className="truncate">{chip.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
