/**
 * StageHeader — compact top bar overlaid on the 3D stage.
 *
 * Primary screen shows:
 *  • CampusAI logo pill (left)
 *  • Animated state chip with live dot (center-left)
 *  • Studio button (right)
 *
 * No persona strip, no accessories, no debug toggle here.
 * Those are behind the Studio sheet or PersonaPicker popover.
 */
import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers } from 'lucide-react';
import { MotionButton } from './MotionButton';
import { popIn } from './motion';

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'alert';

interface StageHeaderProps {
  avatarState: AvatarState;
  activeEmotionMood: string;
  onOpenStudio: () => void;
}

const STATE_COLORS: Record<AvatarState, { dot: string; label: string; text: string }> = {
  idle:      { dot: 'bg-emerald-400',              label: 'Ready',          text: 'text-emerald-300' },
  listening: { dot: 'bg-rose-500 animate-ping',    label: 'Listening…',     text: 'text-rose-300' },
  thinking:  { dot: 'bg-amber-400 animate-pulse',  label: 'Thinking…',      text: 'text-amber-300' },
  speaking:  { dot: 'bg-sky-400 animate-pulse',    label: 'Speaking',       text: 'text-sky-300' },
  success:   { dot: 'bg-emerald-400 animate-ping', label: 'Done!',          text: 'text-emerald-300' },
  alert:     { dot: 'bg-amber-400 animate-ping',   label: 'Attention',      text: 'text-amber-300' },
};

export const StageHeader = memo(function StageHeader({
  avatarState,
  activeEmotionMood,
  onOpenStudio,
}: StageHeaderProps) {
  const cfg = STATE_COLORS[avatarState];

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 pt-3 pointer-events-none">
      {/* Left: Brand chip */}
      <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-lg pointer-events-auto">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-bold text-white tracking-wide">CampusAI</span>

        {/* Live state chip */}
        <AnimatePresence mode="wait">
          <motion.span
            key={avatarState}
            variants={popIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className={`flex items-center gap-1.5 ml-1 ${cfg.text}`}
          >
            <span className={`relative flex h-2 w-2 shrink-0`}>
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot.split(' ')[0]}`} />
            </span>
            <span className="text-[11px] font-semibold hidden sm:inline truncate max-w-[120px]">
              {avatarState === 'idle'
                ? (activeEmotionMood.length > 22
                  ? activeEmotionMood.substring(0, 22) + '…'
                  : activeEmotionMood)
                : cfg.label}
            </span>
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Right: Studio button */}
      <MotionButton
        onClick={onOpenStudio}
        className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-500/40 text-indigo-300 shadow-lg hover:border-indigo-400/70 hover:text-indigo-200 transition-colors text-xs font-semibold pointer-events-auto"
        aria-label="Open Studio"
        title="Open Movement Studio"
      >
        <Layers className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Studio</span>
      </MotionButton>
    </div>
  );
});
