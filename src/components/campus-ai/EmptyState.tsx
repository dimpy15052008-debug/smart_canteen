/**
 * EmptyState — welcome card shown when the chat has only the intro message.
 *
 * Shows 4 large starter tiles in a 2×2 grid.
 * Each tile sends its prompt on tap.
 * Fades away with AnimatePresence once messages.length > 1.
 */
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MotionButton } from './MotionButton';
import { staggerParent, fadeUp } from './motion';

interface StarterTile {
  icon: string;
  label: string;
  prompt: string;
  gradient: string;
}

const STARTER_TILES: StarterTile[] = [
  {
    icon: '📊',
    label: 'My Attendance Risk',
    prompt: 'What is my current attendance status and am I at risk of detention?',
    gradient: 'from-rose-500/20 to-rose-600/10',
  },
  {
    icon: '📝',
    label: 'Next Exam',
    prompt: 'When is my next examination and where is my seat hall?',
    gradient: 'from-amber-500/20 to-amber-600/10',
  },
  {
    icon: '💰',
    label: 'Fee Dues',
    prompt: 'What are my pending fee dues and when is the payment deadline?',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
  },
  {
    icon: '🧠',
    label: 'Explain a Concept',
    prompt: 'Can you explain the core concepts of Machine Learning in our CS603 syllabus?',
    gradient: 'from-indigo-500/20 to-violet-600/10',
  },
];

interface EmptyStateProps {
  onSend: (prompt: string) => void;
  userName: string;
}

export const EmptyState = memo(function EmptyState({ onSend, userName }: EmptyStateProps) {
  return (
    <motion.div
      variants={staggerParent(0.06, 0.1)}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
      className="flex flex-col items-center justify-center h-full py-6 px-2"
    >
      {/* Welcome */}
      <motion.div variants={fadeUp} className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-indigo-500/25">
          <span className="text-2xl">🤖</span>
        </div>
        <h2 className="text-base font-bold text-slate-800 dark:text-white">
          Hey {userName.split(' ')[0]}!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] mx-auto">
          I'm your CampusAI companion. Ask me anything or tap a tile to get started.
        </p>
      </motion.div>

      {/* Starter tiles */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-[360px]">
        {STARTER_TILES.map(tile => (
          <motion.div key={tile.prompt} variants={fadeUp}>
            <MotionButton
              onClick={() => onSend(tile.prompt)}
              className={`w-full p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-br ${tile.gradient} backdrop-blur-sm text-left transition-all hover:border-indigo-400/50 group`}
              aria-label={tile.label}
            >
              <span className="text-2xl block mb-2">{tile.icon}</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                {tile.label}
              </span>
            </MotionButton>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
