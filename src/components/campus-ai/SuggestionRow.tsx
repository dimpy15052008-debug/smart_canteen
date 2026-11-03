/**
 * SuggestionRow — compact suggestion chip row with category tabs.
 *
 * Shows: category tabs | 3-5 visible chips | "More" chip
 * - Active tab has a shared-layout pill (layoutId="tab-pill")
 * - Chips gently auto-rotate every 4s (paused on hover/focus)
 * - "More" chip opens a sheet with all prompts
 * - No horizontal scrollbar (edge fade masks on the chip row)
 */
import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, List } from 'lucide-react';
import { MotionButton } from './MotionButton';
import { backdropVariant, slideUp, staggerParent, fadeUp, popIn } from './motion';

interface QuickPrompt {
  label: string;
  prompt: string;
  category: 'academics' | 'exams' | 'fees' | 'campus' | 'concepts' | 'fun';
  icon: string;
}

type CategoryId = 'all' | 'academics' | 'exams' | 'fees' | 'campus' | 'concepts';

interface SuggestionRowProps {
  prompts: QuickPrompt[];
  onSend: (prompt: string) => void;
}

const CATEGORY_TABS: { id: CategoryId; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'academics', label: '📊 Academics' },
  { id: 'exams',     label: '📝 Exams' },
  { id: 'fees',      label: '💰 Fees' },
  { id: 'campus',    label: '🚌 Campus' },
  { id: 'concepts',  label: '🤖 AI & Tech' },
];

const VISIBLE_CHIPS = 3;

export const SuggestionRow = memo(function SuggestionRow({ prompts, onSend }: SuggestionRowProps) {
  const [category, setCategory] = useState<CategoryId>('all');
  const [offset, setOffset]     = useState(0);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  const filtered = prompts.filter(p => category === 'all' || p.category === category);
  const visible  = filtered.slice(offset, offset + VISIBLE_CHIPS);
  const hasMore  = filtered.length > VISIBLE_CHIPS;

  // Auto-rotate chips every 4s (paused on hover/focus)
  useEffect(() => {
    if (isPaused || filtered.length <= VISIBLE_CHIPS) return;
    timerRef.current = setInterval(() => {
      setOffset(prev => (prev + 1) % Math.max(1, filtered.length - VISIBLE_CHIPS + 1));
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [filtered.length, isPaused]);

  // Reset offset on category change
  useEffect(() => { setOffset(0); }, [category]);

  const handleChipClick = useCallback((prompt: string) => {
    onSend(prompt);
    setIsMoreOpen(false);
  }, [onSend]);

  return (
    <>
      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2">
        {/* Category tabs */}
        <div className="relative flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`relative px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                category === tab.id
                  ? 'text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {category === tab.id && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Chip row */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map(item => (
              <motion.div
                key={`${item.prompt}-${offset}`}
                initial={{ opacity: 0, scale: 0.92, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.92, x: -8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="shrink-0"
              >
                <MotionButton
                  onClick={() => handleChipClick(item.prompt)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-slate-700/60 text-xs whitespace-nowrap transition-all"
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </MotionButton>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* More button */}
          {hasMore && (
            <MotionButton
              onClick={() => setIsMoreOpen(true)}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs transition-colors"
              aria-label="Show more suggestions"
            >
              <List className="w-3 h-3" />
              <span>More</span>
            </MotionButton>
          )}
        </div>
      </div>

      {/* More sheet */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              variants={backdropVariant}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setIsMoreOpen(false)}
            />
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[75dvh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="All suggested prompts"
            >
              <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">Quick Prompts</h2>
                <MotionButton onClick={() => setIsMoreOpen(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </MotionButton>
              </div>

              {CATEGORY_TABS.map(tab => {
                const items = prompts.filter(p => tab.id === 'all' || p.category === tab.id);
                if (tab.id !== 'all' && items.length === 0) return null;
                const sectionItems = tab.id === 'all' ? [] : items;
                if (tab.id === 'all') return null;
                return (
                  <div key={tab.id} className="mb-4">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">{tab.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sectionItems.map((item, idx) => (
                        <MotionButton
                          key={idx}
                          onClick={() => handleChipClick(item.prompt)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all"
                        >
                          <span>{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </MotionButton>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});
