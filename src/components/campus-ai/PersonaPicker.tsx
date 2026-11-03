/**
 * PersonaPicker — collapsed persona selector.
 *
 * Primary screen: ONE pill showing active persona icon + name.
 * Click → opens an overlay sheet with all 6 personas as cards.
 * Each card has: icon, name, tagline, and a "Preview" button.
 * Active card has shared-layout highlight ring.
 */
import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { MotionButton } from './MotionButton';
import { VOICE_PERSONAS, VoicePersona, VoicePersonaConfig } from './CampusAIAssistant';
import { backdropVariant, slideUp, staggerParent, personaCard } from './motion';

interface PersonaPickerProps {
  activePersona: VoicePersona;
  onSelect: (id: VoicePersona) => void;
  onPreview: (persona: VoicePersonaConfig) => void;
  onOpenElevenLabs: () => void;
}

export const PersonaPicker = memo(function PersonaPicker({
  activePersona,
  onSelect,
  onPreview,
  onOpenElevenLabs,
}: PersonaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPersona = VOICE_PERSONAS.find(p => p.id === activePersona) || VOICE_PERSONAS[0];

  const handleSelect = useCallback((id: VoicePersona) => {
    onSelect(id);
    setIsOpen(false);
  }, [onSelect]);

  return (
    <>
      {/* Collapsed pill trigger */}
      <MotionButton
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/60 hover:border-indigo-500/50 text-slate-200 text-xs font-semibold transition-colors shadow-sm"
        aria-label="Change voice persona"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Change AI voice persona"
      >
        <span className="text-base leading-none">{currentPersona.icon}</span>
        <span className="hidden sm:inline max-w-[90px] truncate">{currentPersona.badge}</span>
        <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </MotionButton>

      {/* Persona sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariant}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[85dvh] overflow-y-auto shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Select voice persona"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Voice Persona</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Choose how your CampusAI companion sounds</p>
                </div>
                <MotionButton
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  aria-label="Close persona picker"
                >
                  <X className="w-4 h-4" />
                </MotionButton>
              </div>

              {/* Persona cards */}
              <motion.div
                variants={staggerParent(0.04)}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {VOICE_PERSONAS.map(persona => {
                  const isActive = persona.id === activePersona;
                  return (
                    <motion.div
                      key={persona.id}
                      variants={personaCard}
                      className={`relative rounded-2xl border p-4 cursor-pointer transition-colors ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-800 bg-slate-800/60 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                      onClick={() => handleSelect(persona.id)}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="persona-active-ring"
                          className="absolute inset-0 rounded-2xl border-2 border-indigo-500 pointer-events-none"
                        />
                      )}

                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{persona.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{persona.badge}</span>
                            {isActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{persona.tagline}</p>
                        </div>

                        <MotionButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreview(persona);
                          }}
                          className="p-2 rounded-xl bg-slate-700/80 hover:bg-indigo-500/30 text-slate-400 hover:text-indigo-300 transition-colors shrink-0 mt-0.5"
                          aria-label={`Preview ${persona.name}`}
                          title={`Preview ${persona.name}`}
                        >
                          <Play className="w-3 h-3" />
                        </MotionButton>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* ElevenLabs link */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-500">Want a neural AI voice?</p>
                <MotionButton
                  onClick={() => { setIsOpen(false); onOpenElevenLabs(); }}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors underline"
                  aria-label="Configure ElevenLabs AI voice"
                >
                  ElevenLabs Settings →
                </MotionButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});
