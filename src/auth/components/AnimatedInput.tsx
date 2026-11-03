import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../motion/hooks';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string | null;
  required?: boolean;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  id,
  label,
  helperText,
  error,
  required = false,
  value,
  onChange,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const prefersReduced = usePrefersReducedMotion();
  const hasValue = Boolean(value && String(value).length > 0);

  return (
    <div className="space-y-1.5 relative">
      {/* Label with pulsing asterisk until field has value */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className={`block text-xs font-medium transition-colors duration-200 ${
            error
              ? 'text-rose-400'
              : isFocused
              ? 'text-[var(--role-accent,#6366f1)]'
              : 'text-slate-300'
          }`}
        >
          {label}
          {required && (
            <motion.span
              className="ml-1 inline-block text-rose-400"
              animate={
                hasValue || prefersReduced
                  ? { scale: 1, opacity: 0.7 }
                  : { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }
              }
              transition={{ duration: 2, repeat: hasValue ? 0 : Infinity, ease: 'easeInOut' }}
            >
              *
            </motion.span>
          )}
        </label>
      </div>

      {/* Input container with shake animation on error */}
      <motion.div
        className="relative"
        animate={
          error && !prefersReduced
            ? { x: [-6, 6, -4, 4, -2, 2, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.28, ease: 'easeInOut' }}
      >
        <input
          id={id}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all duration-200 ${
            error
              ? 'border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
              : isFocused
              ? 'border-[var(--role-accent,#6366f1)] shadow-[0_0_14px_var(--role-glow,rgba(99,102,241,0.25))]'
              : 'border-slate-800 hover:border-slate-700'
          } ${className}`}
          {...props}
        />

        {/* Gradient underline sweep on focus */}
        {!prefersReduced && (
          <motion.div
            className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--role-accent, #6366f1), var(--role-accent2, #8b5cf6), transparent)',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isFocused ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
      </motion.div>

      {/* Helper text or error */}
      {helperText && !error && (
        <p className="text-[11px] text-slate-500 leading-tight">{helperText}</p>
      )}
    </div>
  );
};
