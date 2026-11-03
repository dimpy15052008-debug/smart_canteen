/**
 * StudioSheet — progressive-disclosure movement/accessory controller.
 *
 * Opens as a bottom sheet (mobile) or right slide-over (laptop+).
 * Contents:
 *  • Search input
 *  • Category filter tabs (All, Cool & Funny, Explaining, Emotions, Status)
 *  • Animated 44-movement grid (staggered cards)
 *  • Accessory toggles (Headphones, Shades) below the grid
 *  • Voice speed slider
 *  • Debug Mode toggle (only here, not on main screen)
 */
import React, { memo, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Headphones, Glasses } from 'lucide-react';
import { MotionButton } from './MotionButton';
import type { RobotMovement } from './Avatar3DCanvas';
import { backdropVariant, slideUp, slideRight, staggerParent, studioCard, DUR } from './motion';
import { useMediaTier } from './useMediaTier';

interface RobotMovementItem {
  id: RobotMovement;
  label: string;
  icon: string;
  category: 'smart' | 'cool_funny' | 'work' | 'emotions' | 'status';
  desc: string;
  voiceSnippet: string;
}

interface StudioSheetProps {
  isOpen: boolean;
  onClose: () => void;
  movements: RobotMovementItem[];
  currentMovement: RobotMovement;
  onMovementSelect: (mov: RobotMovementItem) => void;
  wearHeadphones: boolean;
  wearSunglasses: boolean;
  onToggleHeadphones: () => void;
  onToggleSunglasses: () => void;
  selectedVoiceSpeed: number;
  onVoiceSpeedChange: (v: number) => void;
  isDebugMode: boolean;
  onToggleDebugMode: () => void;
  restStyle: 'alive' | 'chill' | 'zen';
  onRestStyleChange: (s: 'alive' | 'chill' | 'zen') => void;
}

type TabId = 'all' | 'cool_funny' | 'work' | 'emotions' | 'status';

const TABS: { id: TabId; label: string }[] = [
  { id: 'all',        label: 'All' },
  { id: 'cool_funny', label: '😎 Cool & Fun' },
  { id: 'work',       label: '🗣️ Explaining' },
  { id: 'emotions',   label: '😄 Emotions' },
  { id: 'status',     label: '✨ Rest' },
];

export const StudioSheet = memo(function StudioSheet({
  isOpen,
  onClose,
  movements,
  currentMovement,
  onMovementSelect,
  wearHeadphones,
  wearSunglasses,
  onToggleHeadphones,
  onToggleSunglasses,
  selectedVoiceSpeed,
  onVoiceSpeedChange,
  isDebugMode,
  onToggleDebugMode,
  restStyle,
  onRestStyleChange,
}: StudioSheetProps) {
  const tier = useMediaTier();
  const [tab, setTab] = useState<TabId>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = tab === 'all'
      ? movements
      : tab === 'status'
      ? movements.filter(m => m.category === 'smart' || m.category === 'status')
      : movements.filter(m => m.category === tab);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.label.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.icon.includes(q),
      );
    }
    return list;
  }, [movements, tab, search]);

  const isLaptopUp = tier === 'laptop' || tier === 'desktop';
  const sheetVariant = isLaptopUp ? slideRight : slideUp;
  const sheetClass = isLaptopUp
    ? 'fixed top-0 right-0 bottom-0 z-50 w-[380px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col'
    : 'fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col max-h-[88dvh]';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            variants={sheetVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            className={sheetClass}
            role="dialog"
            aria-modal="true"
            aria-label="Movement Studio"
          >
            {/* Drag handle (mobile) */}
            {!isLaptopUp && <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-3 mb-2 shrink-0" />}

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
              <div>
                <h2 className="text-sm font-bold text-white">Movement Studio</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{movements.length} actions available</p>
              </div>
              <MotionButton
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                aria-label="Close studio"
              >
                <X className="w-4 h-4" />
              </MotionButton>
            </div>

            {/* Accessories */}
            <div className="px-5 py-3 border-b border-slate-800 shrink-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-semibold">Accessories</p>
              <div className="flex items-center gap-2">
                <MotionButton
                  onClick={onToggleHeadphones}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    wearHeadphones
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  aria-pressed={wearHeadphones}
                  aria-label="Toggle DJ headphones"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Headphones</span>
                </MotionButton>
                <MotionButton
                  onClick={onToggleSunglasses}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    wearSunglasses
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  aria-pressed={wearSunglasses}
                  aria-label="Toggle sunglasses"
                >
                  <span>🕶️</span>
                  <span>Sunglasses</span>
                </MotionButton>
              </div>
            </div>

            {/* Search */}
            <div className="px-5 pt-3 pb-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search actions…"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 px-5 pb-2 overflow-x-auto shrink-0 no-scrollbar">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap shrink-0 ${
                    tab === t.id
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Movement grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <span className="text-3xl mb-2">🔍</span>
                  <p className="text-xs">No actions match "{search}"</p>
                </div>
              ) : (
                <motion.div
                  key={`${tab}-${search}`}
                  variants={staggerParent(0.03)}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-2 pt-1"
                >
                  {filtered.map(mov => {
                    const isActive = currentMovement === mov.id;
                    return (
                      <motion.button
                        key={mov.id}
                        variants={studioCard}
                        onClick={() => onMovementSelect(mov)}
                        className={`p-3 rounded-xl text-left border text-xs transition-colors flex items-center gap-2.5 ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-500 ring-1 ring-indigo-400/50 shadow-md'
                            : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                        title={mov.desc}
                        aria-pressed={isActive}
                      >
                        <span className="text-base shrink-0">{mov.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{mov.label}</div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {mov.category}
                          </div>
                        </div>
                        {isActive && (
                          <motion.span
                            layoutId="studio-active-dot"
                            className="w-1.5 h-1.5 rounded-full bg-white shrink-0"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Bottom controls */}
            <div className="border-t border-slate-800 px-5 py-4 space-y-3 shrink-0">
              {/* Voice speed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Voice Speed
                  </label>
                  <span className="text-[11px] font-bold text-indigo-400 tabular-nums">
                    {selectedVoiceSpeed.toFixed(2)}×
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={selectedVoiceSpeed}
                  onChange={e => onVoiceSpeedChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                  aria-label="Voice speed"
                />
              </div>

              {/* Rest style */}
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
                  Idle Style
                </p>
                <div className="flex gap-1.5">
                  {(['alive', 'chill', 'zen'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => onRestStyleChange(s)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                        restStyle === s
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s === 'alive' ? '🤖' : s === 'chill' ? '😌' : '🧘'} {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Debug mode */}
              <MotionButton
                onClick={onToggleDebugMode}
                className={`w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isDebugMode
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                aria-pressed={isDebugMode}
              >
                <span>🛠️</span>
                <span>{isDebugMode ? 'Debug Mode: ON' : 'Enable Debug Mode'}</span>
              </MotionButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
