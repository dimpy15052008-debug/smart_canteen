/**
 * StageToolbar — compact bottom action bar on the 3D stage.
 *
 * Shows ONLY the 4 most-used controls (Mic, Voice, SFX, Rest).
 * Accessories, Debug, and persona management are in the Studio sheet.
 */
import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Bell, BellOff } from 'lucide-react';
import { MotionButton } from './MotionButton';

interface StageToolbarProps {
  isListening: boolean;
  voiceEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMic: () => void;
  onToggleVoice: () => void;
  onToggleSFX: () => void;
  onRest: () => void;
}

export const StageToolbar = memo(function StageToolbar({
  isListening,
  voiceEnabled,
  sfxEnabled,
  onToggleMic,
  onToggleVoice,
  onToggleSFX,
  onRest,
}: StageToolbarProps) {
  const shouldReduceMotion = useReducedMotion();

  const micRingAnimation = shouldReduceMotion
    ? {}
    : { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.2 } };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 px-3 pb-3 pointer-events-none"
      role="toolbar"
      aria-label="Stage controls"
    >
      <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-full border border-slate-700/60 shadow-xl pointer-events-auto">

        {/* Mic button */}
        <div className="relative">
          {isListening && !shouldReduceMotion && (
            <motion.span
              className="absolute inset-0 rounded-full bg-rose-500/30 -z-10"
              animate={micRingAnimation}
            />
          )}
          <MotionButton
            onClick={onToggleMic}
            className={`relative p-2.5 rounded-full transition-colors ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            aria-pressed={isListening}
            title={isListening ? 'Stop listening (mic active)' : 'Voice input (hold to talk)'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isListening ? 'off' : 'on'}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.12 }}
                className="flex"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.span>
            </AnimatePresence>
          </MotionButton>
        </div>

        <div className="w-px h-6 bg-slate-700/60 mx-0.5" />

        {/* Voice toggle */}
        <MotionButton
          onClick={onToggleVoice}
          className={`p-2.5 rounded-full transition-colors ${
            voiceEnabled
              ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-slate-300'
          }`}
          aria-label={voiceEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
          aria-pressed={voiceEnabled}
          title={voiceEnabled ? 'AI voice: ON (click to mute)' : 'AI voice: OFF (click to unmute)'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={voiceEnabled ? 'on' : 'off'}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              className="flex"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </motion.span>
          </AnimatePresence>
        </MotionButton>

        {/* SFX toggle */}
        <MotionButton
          onClick={onToggleSFX}
          className={`p-2.5 rounded-full transition-colors ${
            sfxEnabled
              ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-slate-300'
          }`}
          aria-label={sfxEnabled ? 'Mute SFX' : 'Enable SFX'}
          aria-pressed={sfxEnabled}
          title={sfxEnabled ? 'SFX: ON (click to mute)' : 'SFX: OFF (click to enable)'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={sfxEnabled ? 'on' : 'off'}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              className="flex"
            >
              {sfxEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </motion.span>
          </AnimatePresence>
        </MotionButton>

        <div className="w-px h-6 bg-slate-700/60 mx-0.5" />

        {/* Rest button */}
        <MotionButton
          onClick={onRest}
          className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          aria-label="Reset robot to rest pose"
          title="Reset pose"
        >
          <RotateCcw className="w-4 h-4" />
        </MotionButton>
      </div>
    </div>
  );
});
