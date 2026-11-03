import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
} from 'lucide-react';
import { useAuth } from './useAuth';
import { UserRole } from '../types';
import { roleVars, getRoleIndex, EASE, DUR } from './motion/tokens';
import { usePrefersReducedMotion, usePointerParallax } from './motion/hooks';
import { AuthCursorProvider, AuthCursorContext } from './components/AuthCursorContext';
import { AuthCursor } from './components/AuthCursor';

// Auth Components
import { AuthBackground } from './components/AuthBackground';
import { AnimatedLogo } from './components/AnimatedLogo';
import { SpotlightCard } from './components/SpotlightCard';
import { RoleTabs } from './components/RoleTabs';
import { RoleScene } from './components/RoleScene';
import { AnimatedInput } from './components/AnimatedInput';
import { PasswordField } from './components/PasswordField';
import { AnimatedCheckbox } from './components/AnimatedCheckbox';
import { AuthButton } from './components/AuthButton';
import { DemoRoleChips } from './components/DemoRoleChips';
import { SuccessOverlay } from './components/SuccessOverlay';

const ROLE_TAB_CONFIG: Record<
  UserRole,
  {
    label: string;
    fieldLabel: string;
    placeholder: string;
    helperText: string;
    sampleId: string;
    samplePass: string;
  }
> = {
  student: {
    label: 'Student',
    fieldLabel: 'Roll Number / Enrollment ID',
    placeholder: 'e.g. 0827CS221045 or ENR-2022-CSE-0145',
    helperText: 'Enter your official university roll number or student email',
    sampleId: '0827CS221045',
    samplePass: 'student123',
  },
  faculty: {
    label: 'Faculty',
    fieldLabel: 'Faculty ID / Email',
    placeholder: 'e.g. FAC-102 or rajesh.sharma@smartuni.edu.in',
    helperText: 'Enter your institutional faculty ID or official email address',
    sampleId: 'FAC-102',
    samplePass: 'faculty123',
  },
  admin: {
    label: 'Admin',
    fieldLabel: 'Admin ID / Email',
    placeholder: 'e.g. ADM-001 or sunita.verma@smartuni.edu.in',
    helperText: 'Enter your administrator credentials to access governance portals',
    sampleId: 'ADM-001',
    samplePass: 'admin123',
  },
  canteen: {
    label: 'Canteen',
    fieldLabel: 'Staff ID',
    placeholder: 'e.g. CAN-007 or ramesh.canteen@smartuni.edu.in',
    helperText: 'Enter your kitchen staff ID or food court account handle',
    sampleId: 'CAN-007',
    samplePass: 'canteen123',
  },
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, devLogin, devLoginEnabled, isAuthenticated, user } = useAuth();
  const prefersReduced = usePrefersReducedMotion();

  // Role state
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [prevRole, setPrevRole] = useState<UserRole>('student');
  const [rippleTrigger, setRippleTrigger] = useState<number>(0);

  // Form inputs
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Card view mode: 'login' | 'forgot'
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');
  const [recoverySent, setRecoverySent] = useState<boolean>(false);

  // Auto-fill animation state
  const [isAutoFilling, setIsAutoFilling] = useState<boolean>(false);

  // Success Transition state
  const [isSuccessActive, setIsSuccessActive] = useState<boolean>(false);
  const [successRole, setSuccessRole] = useState<UserRole>('student');

  // Cold open choreography state
  const [introFinished, setIntroFinished] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(sessionStorage.getItem('smartuni_auth_intro_played'));
  });

  const nextPath = searchParams.get('next');
  const parallax = usePointerParallax(8);

  // Mark intro finished on user interaction or timer
  const finishIntro = useCallback(() => {
    setIntroFinished(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('smartuni_auth_intro_played', 'true');
    }
  }, []);

  useEffect(() => {
    if (!introFinished) {
      const timer = setTimeout(() => {
        finishIntro();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [introFinished, finishIntro]);

  // If already authenticated and not transitioning, redirect to home
  useEffect(() => {
    if (isAuthenticated && user && !isSuccessActive) {
      const redirectMap: Record<UserRole, string> = {
        student: '/',
        faculty: '/faculty',
        admin: '/admin',
        canteen: '/canteen-staff',
      };
      const defaultHome = redirectMap[user.role] || '/';
      navigate(nextPath && nextPath.startsWith('/') ? nextPath : defaultHome, { replace: true });
    }
  }, [isAuthenticated, user, navigate, nextPath, isSuccessActive]);

  // Handle role change with ripple trigger
  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === selectedRole) return;
    setPrevRole(selectedRole);
    setSelectedRole(newRole);
    setRippleTrigger((prev) => prev + 1);
    setErrorMsg(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const config = ROLE_TAB_CONFIG[selectedRole];
    if (!identifier.trim()) {
      setErrorMsg(`Please enter your ${config.fieldLabel}.`);
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier, password, selectedRole);
      // Trigger cinematic success sequence
      setSuccessRole(selectedRole);
      setIsSuccessActive(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials or server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = async (role: UserRole) => {
    setErrorMsg(null);
    setInfoMsg(null);
    setIsSubmitting(true);
    try {
      await devLogin(role);
      setSuccessRole(role);
      setIsSuccessActive(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
      setIsSubmitting(false);
    }
  };

  // Final Navigation after Success Transition completes
  const handleFinalNavigation = () => {
    const redirectMap: Record<UserRole, string> = {
      student: '/',
      faculty: '/faculty',
      admin: '/admin',
      canteen: '/canteen-staff',
    };
    const defaultHome = redirectMap[successRole] || '/';
    navigate(nextPath && nextPath.startsWith('/') ? nextPath : defaultHome, { replace: true });
  };

  // Realistic Auto-fill Simulation with character typing
  const autofillTimeoutRef = useRef<number[]>([]);
  const handleAutoFill = () => {
    if (isAutoFilling) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setIsAutoFilling(true);

    // Clear existing typing timeouts
    autofillTimeoutRef.current.forEach(clearTimeout);
    autofillTimeoutRef.current = [];

    const config = ROLE_TAB_CONFIG[selectedRole];
    const targetId = config.sampleId;
    const targetPass = config.samplePass;

    setIdentifier('');
    setPassword('');

    // Type identifier character by character (35ms per char)
    let currentDelay = 50;
    for (let i = 1; i <= targetId.length; i++) {
      const sub = targetId.slice(0, i);
      const t = window.setTimeout(() => {
        setIdentifier(sub);
      }, currentDelay);
      autofillTimeoutRef.current.push(t);
      currentDelay += 35;
    }

    // Short pause between fields
    currentDelay += 100;

    // Type password
    for (let j = 1; j <= targetPass.length; j++) {
      const sub = targetPass.slice(0, j);
      const t = window.setTimeout(() => {
        setPassword(sub);
      }, currentDelay);
      autofillTimeoutRef.current.push(t);
      currentDelay += 35;
    }

    // Finish autofill
    const finalT = window.setTimeout(() => {
      setIsAutoFilling(false);
      setInfoMsg('Credentials populated. Click "Sign in" to continue.');
    }, currentDelay + 50);
    autofillTimeoutRef.current.push(finalT);
  };

  useEffect(() => {
    return () => {
      autofillTimeoutRef.current.forEach(clearTimeout);
    };
  }, []);

  // Forgot Password Submit
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setErrorMsg('Please enter your institutional email address.');
      return;
    }
    setErrorMsg(null);
    setRecoverySent(true);
    setInfoMsg('Recovery link sent! Please check your institutional inbox.');
  };

  const currentConfig = ROLE_TAB_CONFIG[selectedRole];
  const currIdx = getRoleIndex(selectedRole);
  const prevIdx = getRoleIndex(prevRole);
  const direction = currIdx >= prevIdx ? 1 : -1;

  // Directional form animation variants
  const formContentVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: prefersReduced ? 0 : dir * 18,
      filter: prefersReduced ? 'none' : 'blur(4px)',
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.35, ease: EASE.expoOut },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: prefersReduced ? 0 : -dir * 18,
      filter: prefersReduced ? 'none' : 'blur(4px)',
      transition: { duration: 0.22, ease: EASE.smooth },
    }),
  };

  // Fine-pointer detection for AuthCursor
  const [isFinePointer, setIsFinePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handler = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <AuthCursorProvider>
    <div
      style={roleVars(selectedRole)}
      onClick={!introFinished ? finishIntro : undefined}
      onKeyDown={!introFinished ? finishIntro : undefined}
      className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative"
    >
      {/* Global cursor ring — fine-pointer desktop only */}
      {isFinePointer && (
        <AuthCursorContext.Consumer>
          {(ctx) => ctx && (
            <AuthCursor role={selectedRole} cursorState={ctx.cursorState} />
          )}
        </AuthCursorContext.Consumer>
      )}
      {/* ─── Living Interactive Background ──────────────────────────────── */}
      <AuthBackground role={selectedRole} rippleTrigger={rippleTrigger} />

      {/* ─── LEFT: Brand & Value Proposition Panel ───────────────────────── */}
      <div
        onMouseMove={parallax.handleMouseMove}
        onMouseLeave={parallax.handleMouseLeave}
        className="lg:col-span-5 relative z-10 p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-indigo-900/30 overflow-hidden"
      >
        {/* Parallax layer wrapper */}
        <motion.div
          style={{
            x: prefersReduced ? 0 : parallax.x,
            y: prefersReduced ? 0 : parallax.y,
          }}
          className="flex flex-col justify-between h-full space-y-10"
        >
          {/* Header Brand Lockup */}
          <div className="flex items-center justify-between">
            <AnimatedLogo
              variant="full"
              showTagline={true}
              className="h-16 lg:h-20 w-auto"
              animateIntro={!introFinished}
            />

            {/* Mobile Quick Jump Button */}
            <button
              type="button"
              onClick={() =>
                document.getElementById('login-form-card')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:border-slate-700 transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reactive Role Scene (Headline, description, and feature cards) */}
          <div className="my-auto py-6">
            <RoleScene role={selectedRole} prevRole={prevRole} />
          </div>

          {/* Footer Security Badges */}
          <div className="pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>Protected by Enterprise RBAC & RLS</span>
            <span className="font-mono text-[10px] text-indigo-400">v3.0 Production Ready</span>
          </div>
        </motion.div>
      </div>

      {/* ─── RIGHT: Form Card Panel ─────────────────────────────────────── */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 relative z-10">
        <motion.div
          id="login-form-card"
          initial={!introFinished ? { opacity: 0, y: 35, scale: 0.96 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: DUR.cinematic, ease: EASE.expoOut }}
          className="max-w-md w-full space-y-6 relative"
        >
          {/* Header */}
          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign in to your portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your institutional role tab and authenticate below.
            </p>
          </div>

          {/* 1. Role Tabs */}
          <RoleTabs
            selectedRole={selectedRole}
            onSelectRole={handleRoleChange}
          />

          {/* 2. Spotlight Hero Form Card */}
          <SpotlightCard maxTilt={3}>
            {/* View Mode Swap: Login vs Forgot Password */}
            <AnimatePresence mode="wait">
              {viewMode === 'login' ? (
                <motion.div
                  key="login-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {/* Error Alert */}
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
                      role="alert"
                      aria-live="polite"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium">{errorMsg}</div>
                    </motion.div>
                  )}

                  {/* Info / Success Alert */}
                  {infoMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5"
                      role="status"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium">{infoMsg}</div>
                    </motion.div>
                  )}

                  {/* Auto-fill Sample Card */}
                  <div className="relative p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs overflow-hidden group">
                    {/* Slow moving shimmer along border */}
                    {!prefersReduced && (
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none opacity-30"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent 0%, var(--role-glow, rgba(99,102,241,0.2)) 50%, transparent 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'border-shimmer 4s linear infinite',
                        }}
                      />
                    )}

                    <div className="space-y-0.5 pr-2 relative z-10">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--role-accent,#6366f1)]" />
                        <span>Sample {currentConfig.label} Account</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        ID: {currentConfig.sampleId} • Pass: {currentConfig.samplePass}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isAutoFilling}
                      onClick={handleAutoFill}
                      className="px-3 py-1.5 rounded-lg bg-[var(--role-accent,#6366f1)]/20 hover:bg-[var(--role-accent,#6366f1)]/35 text-white border border-[var(--role-accent,#6366f1)]/40 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 relative z-10 disabled:opacity-50"
                    >
                      <motion.div
                        animate={isAutoFilling ? { rotate: 360 } : undefined}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-3 h-3 text-[var(--role-accent,#6366f1)]" />
                      </motion.div>
                      <span>{isAutoFilling ? 'Typing...' : 'Auto-fill'}</span>
                    </button>
                  </div>

                  {/* Actual Form Fields with Directional Content Swap */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={selectedRole}
                        custom={direction}
                        variants={formContentVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="space-y-4"
                      >
                        {/* Identifier Field */}
                        <AnimatedInput
                          id="identifier"
                          label={currentConfig.fieldLabel}
                          placeholder={currentConfig.placeholder}
                          helperText={currentConfig.helperText}
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                        />

                        {/* Password Field */}
                        <PasswordField
                          id="password"
                          label="Password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onForgotPasswordClick={() => {
                            setErrorMsg(null);
                            setInfoMsg(null);
                            setViewMode('forgot');
                          }}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Remember Me Checkbox */}
                    <div className="pt-1">
                      <AnimatedCheckbox
                        checked={rememberMe}
                        onChange={setRememberMe}
                        label="Keep me signed in on this device"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">                                   <AuthButton
                                     type="submit"
                                     role={selectedRole}
                                     label={`Sign in as ${currentConfig.label}`}
                                     isSubmitting={isSubmitting}
                                     isSuccess={isSuccessActive}
                                     isError={Boolean(errorMsg)}
                                     formValid={Boolean(identifier.trim() && password.trim())}
                                   />
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* Forgot Password In-Card Swap View */
                <motion.div
                  key="forgot-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: EASE.expoOut }}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setInfoMsg(null);
                      setViewMode('login');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to sign in</span>
                  </button>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white tracking-tight">Reset password</h3>
                    <p className="text-xs text-slate-400">
                      Enter your institutional email address and we'll send a password recovery token.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {infoMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>{infoMsg}</span>
                    </div>
                  )}

                  {!recoverySent ? (
                    <form onSubmit={handleRecoverySubmit} className="space-y-4">
                      <AnimatedInput
                        id="recovery-email"
                        type="email"
                        label="Institutional Email"
                        placeholder="e.g. user@smartuni.edu.in"
                        helperText="A secure reset verification link will be dispatched."
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                      />

                      <AuthButton
                        type="submit"
                        role={selectedRole}
                        label="Send Recovery Link"
                        isSubmitting={isSubmitting}
                      />
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                        <Mail className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-slate-300">
                        Check your email inbox ({recoveryEmail}) for reset instructions.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoverySent(false);
                          setViewMode('login');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                      >
                        Return to sign in
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </SpotlightCard>

          {/* 3. Quick Dev Demo Chips (Rendered when devLoginEnabled is true) */}
          {devLoginEnabled && (
            <DemoRoleChips
              onSelectRole={handleQuickDemoLogin}
              disabled={isSubmitting || isSuccessActive}
            />
          )}
        </motion.div>
      </div>

      {/* ─── Cinematic Success Overlay ────────────────────────────────────── */}
      <SuccessOverlay
        role={successRole}
        isActive={isSuccessActive}
        onComplete={handleFinalNavigation}
      />
    </div>
    </AuthCursorProvider>
  );
};
