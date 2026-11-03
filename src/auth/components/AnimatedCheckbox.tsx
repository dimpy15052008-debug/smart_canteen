import React from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../motion/hooks';

interface AnimatedCheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  id = 'remember-me',
  checked,
  onChange,
  label,
}) => {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-2.5 cursor-pointer select-none group"
    >
      <div className="relative flex items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />

        {/* Checkbox Box */}
        <motion.div
          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors duration-200 ${
            checked
              ? 'bg-[var(--role-accent,#6366f1)] border-[var(--role-accent,#6366f1)] shadow-[0_0_10px_var(--role-glow,rgba(99,102,241,0.3))]'
              : 'bg-slate-950 border-slate-700 group-hover:border-slate-500'
          }`}
          whileTap={prefersReduced ? undefined : { scale: 0.88 }}
        >
          {/* Checkmark SVG with pathLength draw */}
          <svg
            viewBox="0 0 16 16"
            className="w-3 h-3 text-white pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              initial={false}
              animate={checked ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>

        {/* Tiny ring burst on check */}
        {checked && !prefersReduced && (
          <motion.div
            className="absolute inset-0 rounded-md border border-[var(--role-accent,#6366f1)] pointer-events-none"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}
      </div>

      <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
        {label}
      </span>
    </label>
  );
};
