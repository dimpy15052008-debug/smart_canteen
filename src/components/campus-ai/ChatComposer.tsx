/**
 * ChatComposer — the unified chat input bar.
 *
 * Features:
 *  • Send button: glow when has text, spinner while isThinking
 *  • Mic button: animated pulse rings while listening
 *  • Listening banner with stop button
 *  • Reset conversation button
 *  • safe-area-inset-bottom support for iOS
 */
import React, { memo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mic, MicOff, Send, RefreshCw, X } from 'lucide-react';
import { MotionButton } from './MotionButton';

interface ChatComposerProps {
  inputText: string;
  isListening: boolean;
  isThinking: boolean;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onToggleMic: () => void;
  onReset: () => void;
}

export const ChatComposer = memo(function ChatComposer({
  inputText,
  isListening,
  isThinking,
  onInputChange,
  onSend,
  onToggleMic,
  onReset,
}: ChatComposerProps) {
  const shouldReduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const hasText = inputText.trim().length > 0;

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  const handleClear = useCallback(() => {
    onInputChange('');
    inputRef.current?.focus();
  }, [onInputChange]);

  const micRingAnimation = shouldReduceMotion
    ? {}
    : {
        scale: [1, 1.3, 1],
        opacity: [0.6, 0, 0.6],
        transition: { repeat: Infinity, duration: 1.4 },
      };

  return (
    <div
      className="pt-2 pb-[env(safe-area-inset-bottom)] flex flex-col gap-1.5"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Listening banner */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between"
            role="status"
            aria-live="assertive"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span className="font-medium">Listening… speak clearly</span>
            </div>
            <button
              onClick={onToggleMic}
              className="text-xs font-bold underline hover:text-rose-700"
              aria-label="Stop listening"
            >
              Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {/* Mic button with pulse rings */}
        <div className="relative shrink-0">
          {isListening && !shouldReduceMotion && (
            <motion.span
              className="absolute inset-0 rounded-xl bg-rose-500/25 pointer-events-none"
              animate={micRingAnimation}
            />
          )}
          <MotionButton
            onClick={onToggleMic}
            className={`relative p-2.5 rounded-xl border transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/70'
            }`}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={isListening}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isListening ? 'off' : 'on'}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.12 }}
                className="flex"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.span>
            </AnimatePresence>
          </MotionButton>
        </div>

        {/* Text input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything (attendance, exams, fees, ML concepts…)"
            className={`w-full bg-slate-50 dark:bg-slate-950 border focus:border-indigo-500 rounded-xl pl-4 pr-9 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all ${
              hasText
                ? 'border-indigo-400/70 dark:border-indigo-500/60 shadow-sm shadow-indigo-500/10'
                : 'border-slate-200 dark:border-slate-800'
            }`}
            aria-label="Chat input"
            disabled={isThinking}
          />
          {hasText && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear input"
              tabIndex={-1}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Send button */}
        <MotionButton
          onClick={onSend}
          disabled={!hasText || isThinking}
          className={`px-4 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-1.5 text-sm shrink-0 min-w-[44px] min-h-[44px] justify-center ${
            hasText && !isThinking
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/25'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
          }`}
          aria-label="Send message"
          title="Send (Enter)"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isThinking ? (
              <motion.span
                key="spinner"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                className="flex"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              </motion.span>
            ) : (
              <motion.span
                key="send"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                className="flex items-center gap-1.5"
              >
                <span className="hidden sm:inline">Send</span>
                <Send className="w-3.5 h-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </MotionButton>

        {/* Reset button */}
        <MotionButton
          onClick={onReset}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Reset conversation"
          title="Reset chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </MotionButton>
      </div>
    </div>
  );
});
