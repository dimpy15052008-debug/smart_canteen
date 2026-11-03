import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  Sparkles,
  Check,
  X,
  Play,
  Square,
  Sliders,
  Radio,
  ExternalLink,
  ShieldCheck,
  Key,
  Info,
  RefreshCw,
  Cpu
} from 'lucide-react';
import {
  ElevenLabsVoice,
  ElevenLabsSettings,
  fetchElevenLabsVoices,
  requestElevenLabsAudio,
  playAudioWithLipSync,
  stopElevenLabsAudio
} from '../../utils/elevenLabsAudio';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface ElevenLabsVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ElevenLabsSettings;
  onSaveSettings: (settings: ElevenLabsSettings) => void;
  onTestVoice: (voiceId: string, testText: string) => void;
}

export const ElevenLabsVoiceModal: React.FC<ElevenLabsVoiceModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTestVoice,
}) => {
  const [voiceList, setVoiceList] = useState<ElevenLabsVoice[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeVoiceId, setActiveVoiceId] = useState(settings.voiceId);
  const [modelId, setModelId] = useState(settings.modelId);
  const [stability, setStability] = useState(settings.stability);
  const [similarityBoost, setSimilarityBoost] = useState(settings.similarityBoost);
  const [style, setStyle] = useState(settings.style);
  const [customVoiceId, setCustomVoiceId] = useState('');
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadVoices();
      setActiveVoiceId(settings.voiceId);
      setModelId(settings.modelId);
      setStability(settings.stability);
      setSimilarityBoost(settings.similarityBoost);
      setStyle(settings.style);
    } else {
      stopPreview();
    }
  }, [isOpen, settings]);

  const loadVoices = async () => {
    setLoading(true);
    const data = await fetchElevenLabsVoices();
    setVoiceList(data.voices);
    setIsConfigured(data.configured);
    setLoading(false);
  };

  const stopPreview = () => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewAudio(null);
    }
    setPlayingPreviewId(null);
  };

  const handlePlayPreview = (voice: ElevenLabsVoice) => {
    if (playingPreviewId === voice.voice_id) {
      stopPreview();
      return;
    }

    stopPreview();
    if (voice.preview_url) {
      const audio = new Audio(voice.preview_url);
      audio.onended = () => setPlayingPreviewId(null);
      audio.onerror = () => setPlayingPreviewId(null);
      audio.play().catch(() => setPlayingPreviewId(null));
      setPreviewAudio(audio);
      setPlayingPreviewId(voice.voice_id);
    } else {
      // Test directly with robot
      onTestVoice(
        voice.voice_id,
        `Hello! I am ${voice.name}, your SmartUni 3D robot companion powered by ElevenLabs voice.`
      );
    }
  };

  const handleApply = () => {
    stopPreview();
    const finalVoiceId = customVoiceId.trim() || activeVoiceId;
    onSaveSettings({
      ...settings,
      voiceId: finalVoiceId,
      modelId,
      stability,
      similarityBoost,
      style,
      enabled: true,
    });
    onClose();
  };

  const handleTestSelected = () => {
    stopPreview();
    const finalVoiceId = customVoiceId.trim() || activeVoiceId;
    const selectedVoiceObj = voiceList.find((v) => v.voice_id === finalVoiceId);
    const name = selectedVoiceObj ? selectedVoiceObj.name : 'ElevenLabs';

    setIsTestingVoice(true);
    onTestVoice(
      finalVoiceId,
      `Hello Faizan! This is your 3D campus companion speaking in ${name}'s voice from ElevenLabs. How can I assist you with your courses today?`
    );
    setTimeout(() => setIsTestingVoice(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Connect & Configure ElevenLabs AI Voice
                </h3>
                <Badge variant="ai">Neural Speech</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch neural voice models and synchronize real-time 3D mouth lip-sync with your avatar.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="px-5 sm:px-6 pt-4">
          {isConfigured ? (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>ElevenLabs API Connected:</strong> Real-time neural audio generation is active with custom voice settings.
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 shrink-0">
                Live Engine
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Neural Voice Simulation & Ready for API Key
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  Ready
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                To stream through your personal ElevenLabs plan, set <code>ELEVENLABS_API_KEY=your_key</code> in <code>.env</code>. You can preview all neural voices below and test them with real-time 3D robot lip sync right now!
              </p>
            </div>
          )}
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* 1. Model Selector */}
          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
              Neural Speech Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'eleven_turbo_v2_5',
                  name: 'Eleven Turbo v2.5',
                  desc: 'Ultra-low latency (~250ms), lightning fast responses for real-time conversation.',
                  tag: 'Recommended for 3D Assistant',
                },
                {
                  id: 'eleven_multilingual_v2',
                  name: 'Eleven Multilingual v2',
                  desc: 'Rich emotional expressiveness, supports 29+ languages including Hindi & English.',
                  tag: 'High Emotional Nuance',
                },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setModelId(m.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    modelId === m.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50/40 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{m.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Curated ElevenLabs Voice Catalog */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                Choose ElevenLabs Voice ({voiceList.length} Available)
              </label>
              <button
                onClick={loadVoices}
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {voiceList.map((voice) => {
                const isSelected = activeVoiceId === voice.voice_id && !customVoiceId;
                const isPlaying = playingPreviewId === voice.voice_id;

                return (
                  <div
                    key={voice.voice_id}
                    onClick={() => {
                      setActiveVoiceId(voice.voice_id);
                      setCustomVoiceId('');
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {voice.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {voice.gender} • {voice.accent}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        {voice.tag}
                      </span>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {voice.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="font-mono text-[9px] text-slate-400 truncate max-w-[120px]">
                        ID: {voice.voice_id}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(voice);
                        }}
                        className={`text-[10px] px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                          isPlaying
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isPlaying ? <Square className="w-2.5 h-2.5 fill-white" /> : <Play className="w-2.5 h-2.5" />}
                        <span>{isPlaying ? 'Stop' : 'Sample'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Custom Cloned Voice ID Input */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Or Paste Custom Cloned Voice ID (from ElevenLabs VoiceLab)</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 21m00Tcm4TlvDq8ikWAM or custom voice ID..."
              value={customVoiceId}
              onChange={(e) => setCustomVoiceId(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 4. Fine-Tuning Voice Parameters */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>ElevenLabs Voice Tuning</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setStability(0.5);
                  setSimilarityBoost(0.75);
                  setStyle(0.0);
                }}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Reset to Default
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stability */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Stability</span>
                  <span className="font-mono font-bold text-indigo-600">{Math.round(stability * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={stability}
                  onChange={(e) => setStability(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block">Higher = steady, Lower = expressive</span>
              </div>

              {/* Similarity Boost */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Clarity & Boost</span>
                  <span className="font-mono font-bold text-indigo-600">{Math.round(similarityBoost * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={similarityBoost}
                  onChange={(e) => setSimilarityBoost(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block">High fidelity to original speaker</span>
              </div>

              {/* Style Exaggeration */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Style Exaggeration</span>
                  <span className="font-mono font-bold text-indigo-600">{Math.round(style * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={style}
                  onChange={(e) => setStyle(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block">Amplifies personality & emotion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestSelected}
            disabled={isTestingVoice}
            leftIcon={<Volume2 className="w-3.5 h-3.5 text-indigo-600" />}
          >
            {isTestingVoice ? 'Robot Speaking...' : 'Test Selected Voice on 3D Robot'}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                stopPreview();
                onClose();
              }}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              leftIcon={<Check className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial"
            >
              Save & Connect Voice
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
