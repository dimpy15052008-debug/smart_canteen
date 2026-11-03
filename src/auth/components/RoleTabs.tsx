import React from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../../types';
import { ROLE_THEMES, SPRING, ROLE_ORDER } from '../motion/tokens';
import { usePrefersReducedMotion } from '../motion/hooks';

interface RoleTabsProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  className?: string;
}

// ─── Micro-animated Role Icons ────────────────────────────────────────────────
const StudentIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={active ? { rotate: [-12, 6, -3, 0] } : { rotate: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </motion.svg>
);

const FacultyIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <motion.polyline
      points="16 11 18 13 22 9"
      initial={{ pathLength: 1 }}
      animate={active ? { pathLength: [0, 1] } : { pathLength: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    />
  </svg>
);

const AdminIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v8" />
    <path d="M18 9h2a2 2 0 0 1 2 2v11" />
    {/* Windows lighting up */}
    <motion.path
      d="M10 6h4"
      animate={active ? { opacity: [0.2, 1], stroke: ['#cbd5e1', '#fbbf24'] } : { opacity: 0.7 }}
      transition={{ delay: 0.05, duration: 0.3 }}
    />
    <motion.path
      d="M10 10h4"
      animate={active ? { opacity: [0.2, 1], stroke: ['#cbd5e1', '#fbbf24'] } : { opacity: 0.7 }}
      transition={{ delay: 0.15, duration: 0.3 }}
    />
    <motion.path
      d="M10 14h4"
      animate={active ? { opacity: [0.2, 1], stroke: ['#cbd5e1', '#fbbf24'] } : { opacity: 0.7 }}
      transition={{ delay: 0.25, duration: 0.3 }}
    />
  </svg>
);

const CanteenIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={active ? { rotate: [-8, 8, -4, 0] } : { rotate: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
    <path d="M15 11v11" />
    <path d="M5 2v20" />
    <path d="M2 2h6a3 3 0 0 1 0 6H2" />
  </motion.svg>
);

const ICON_MAP: Record<UserRole, React.FC<{ active: boolean }>> = {
  student: StudentIcon,
  faculty: FacultyIcon,
  admin: AdminIcon,
  canteen: CanteenIcon,
};

export const RoleTabs: React.FC<RoleTabsProps> = ({
  selectedRole,
  onSelectRole,
  className = '',
}) => {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Institutional Role Selector"
      className={`p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 grid grid-cols-4 gap-1.5 relative shadow-inner ${className}`}
    >
      {ROLE_ORDER.map((role) => {
        const isSelected = selectedRole === role;
        const theme = ROLE_THEMES[role];
        const Icon = ICON_MAP[role];

        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={`panel-${role}`}
            onClick={() => onSelectRole(role)}
            className={`relative flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold select-none transition-colors duration-200 z-10 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isSelected
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {/* Active Pill with spring and soft glow trail */}
            {isSelected && (
              <>
                {/* Glow trail behind pill */}
                {!prefersReduced && (
                  <motion.div
                    layoutId="activeRoleTabGlow"
                    className="absolute inset-0 rounded-xl opacity-40 blur-md pointer-events-none -z-10"
                    style={{ backgroundColor: theme.accent }}
                    transition={SPRING.snappy}
                  />
                )}
                {/* Main active pill */}
                <motion.div
                  layoutId="activeRoleTab"
                  className="absolute inset-0 rounded-xl shadow-lg -z-10"
                  style={{
                    backgroundColor: theme.accent,
                    boxShadow: `0 4px 14px 0 ${theme.glow}`,
                  }}
                  transition={SPRING.snappy}
                />
              </>
            )}

            {/* Icon + Label */}
            <motion.span
              className="relative z-10 flex items-center gap-1.5"
              whileHover={prefersReduced ? undefined : { y: -1 }}
              whileTap={prefersReduced ? undefined : { scale: 0.97 }}
            >
              <Icon active={isSelected} />
              <span className="hidden sm:inline font-medium">{theme.label}</span>
              <span className="sm:hidden text-[10px] font-medium leading-none">{theme.label}</span>
            </motion.span>
          </button>
        );
      })}
    </div>
  );
};
