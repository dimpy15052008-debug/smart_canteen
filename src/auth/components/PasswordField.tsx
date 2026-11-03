import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { usePrefersReducedMotion } from '../motion/hooks';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  onForgotPasswordClick?: () => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id = 'password',
  label = 'Password',
  error,
  value,
  onChange,
  onForgotPasswordClick,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);
  const prefersReduced = usePrefersReducedMotion();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
    props.onKeyDown?.(e);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
    props.onKeyUp?.(e);
  };

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'CapsLock') {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    window.addEventListener('keyup', handleGlobalKey);
    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      window.removeEventListener('keyup', handleGlobalKey);
    };
  }, []);

  const hasValue = Boolean(value && String(value).length > 0);

  return (
    <div className="space-y-1.5 relative">
      {/* Label and Forgot Password link */}
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
        </label>

        {onForgotPasswordClick && (
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="group relative text-[11px] font-medium text-slate-400 hover:text-white transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded"
          >
            <span>Forgot password?</span>
            {/* Animated center-out underline */}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[var(--role-accent,#6366f1)] group-hover:w-full transition-all duration-300 ease-out" />
          </button>
        )}
      </div>

      {/* Input container with shake on error */}
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
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholder="••••••••••••"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-white placeholder-slate-500 text-xs sm:text-sm outline-none pr-11 transition-all duration-200 ${
            error
              ? 'border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
              : isFocused
              ? 'border-[var(--role-accent,#6366f1)] shadow-[0_0_14px_var(--role-glow,rgba(99,102,241,0.25))]'
              : 'border-slate-800 hover:border-slate-700'
          } ${className}`}
          {...props}
        />

        {/* Morphing Eye Toggle Button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Eye Outline */}
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
            {/* Eye Slash Path (draws in when hidden) */}
            <motion.line
              x1="3"
              y1="3"
              x2="21"
              y2="21"
              animate={!showPassword ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            />
          </svg>
        </button>

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

      {/* Caps Lock Indicator */}
      <AnimatePresence>
        {isCapsLockOn && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-semibold text-amber-300"
          >
            <ArrowUp className="w-3 h-3" />
            <span>Caps Lock is ON</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
