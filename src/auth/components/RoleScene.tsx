import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../../types';
import { ROLE_SCENES, getRoleIndex, EASE } from '../motion/tokens';
import { Sparkles, Bot, ShieldCheck, UserCheck, Clock, BarChart3, QrCode, UtensilsCrossed } from 'lucide-react';
import { usePrefersReducedMotion } from '../motion/hooks';

interface RoleSceneProps {
  role: UserRole;
  prevRole?: UserRole;
}

// ─── Hero Micro-Details ──────────────────────────────────────────────────────
const AttendanceRingDetail: React.FC = () => (
  <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
      <motion.circle
        cx="18"
        cy="18"
        r="14"
        fill="none"
        stroke="var(--role-accent, #6366f1)"
        strokeWidth="3"
        strokeDasharray="88"
        strokeDashoffset="18"
        strokeLinecap="round"
        initial={{ strokeDashoffset: 88 }}
        animate={{ strokeDashoffset: 18 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
    <span className="absolute text-[8px] font-mono font-bold text-white">82%</span>
  </div>
);

const SparklineDetail: React.FC = () => (
  <div className="w-12 h-6 flex items-end gap-1 shrink-0 px-1 py-0.5 rounded bg-white/5">
    {[40, 75, 55, 90, 85].map((h, i) => (
      <motion.div
        key={i}
        className="w-1.5 rounded-t bg-amber-400"
        initial={{ height: 0 }}
        animate={{ height: `${h}%` }}
        transition={{ duration: 0.5, delay: i * 0.08 }}
      />
    ))}
  </div>
);

const QrScanDetail: React.FC = () => (
  <div className="relative w-8 h-8 flex items-center justify-center shrink-0 bg-white/5 rounded-lg border border-white/10 p-1 overflow-hidden">
    <QrCode className="w-6 h-6 text-orange-400" />
    <motion.div
      className="absolute left-0 right-0 h-[1.5px] bg-rose-400 shadow-[0_0_8px_#fb7185]"
      animate={{ y: [-12, 12, -12] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

const FacultyTicketDetail: React.FC = () => (
  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Clock className="w-4 h-4 text-emerald-400" />
    </motion.div>
  </div>
);

export const RoleScene: React.FC<RoleSceneProps> = ({ role, prevRole }) => {
  const scene = ROLE_SCENES[role];
  const prefersReduced = usePrefersReducedMotion();

  // Direction: if moving to a higher tab index -> slide from right (x: 24), else from left (x: -24)
  const currIdx = getRoleIndex(role);
  const prevIdx = prevRole ? getRoleIndex(prevRole) : currIdx;
  const direction = currIdx >= prevIdx ? 1 : -1;

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: prefersReduced ? 0 : dir * 20,
      filter: prefersReduced ? 'none' : 'blur(4px)',
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.45, ease: EASE.expoOut },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: prefersReduced ? 0 : -dir * 20,
      filter: prefersReduced ? 'none' : 'blur(4px)',
      transition: { duration: 0.28, ease: EASE.smooth },
    }),
  };

  return (
    <div className="relative min-h-[300px]">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={role}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[var(--role-accent)]" />
            <span>{scene.badge}</span>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {scene.headline}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, var(--role-accent, #6366f1) 0%, var(--role-accent2, #8b5cf6) 100%)',
                }}
              >
                {scene.headlineAccent}
              </span>
            </h1>
            <p className="text-sm text-slate-300/90 leading-relaxed max-w-md">
              {scene.description}
            </p>
          </div>

          {/* Value Proposition Cards */}
          <div className="space-y-3.5 pt-2">
            {/* Feature 1 */}
            <motion.div
              whileHover={prefersReduced ? undefined : { x: 5 }}
              className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-sm transition-all"
            >
              <div className="p-2 rounded-lg bg-white/5 text-[var(--role-accent)] shrink-0">
                {role === 'student' && <Bot className="w-5 h-5 text-indigo-400" />}
                {role === 'faculty' && <UserCheck className="w-5 h-5 text-emerald-400" />}
                {role === 'admin' && <BarChart3 className="w-5 h-5 text-amber-400" />}
                {role === 'canteen' && <UtensilsCrossed className="w-5 h-5 text-orange-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{scene.feature1Title}</h4>
                <p className="text-xs text-slate-400 leading-normal">{scene.feature1Desc}</p>
              </div>
              {/* Feature 1 Detail */}
              {role === 'faculty' && <FacultyTicketDetail />}
              {role === 'admin' && <SparklineDetail />}
              {role === 'canteen' && <QrScanDetail />}
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={prefersReduced ? undefined : { x: 5 }}
              className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-sm transition-all"
            >
              <div className="p-2 rounded-lg bg-white/5 text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5 text-[var(--role-accent2)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{scene.feature2Title}</h4>
                <p className="text-xs text-slate-400 leading-normal">{scene.feature2Desc}</p>
              </div>
              {/* Feature 2 Detail */}
              {role === 'student' && <AttendanceRingDetail />}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
