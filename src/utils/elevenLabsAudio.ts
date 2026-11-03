/**
 * ElevenLabs AI Voice Engine & Real-time Web Audio Lip-Sync Bridge for 3D Robot
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  category: string;
  tag: string;
  description: string;
  preview_url?: string;
}

export interface ElevenLabsSettings {
  voiceId: string;
  modelId: string; // 'eleven_turbo_v2_5' | 'eleven_multilingual_v2'
  stability: number; // 0.0 - 1.0
  similarityBoost: number; // 0.0 - 1.0
  style: number; // 0.0 - 1.0
  useSpeakerBoost: boolean;
  enabled: boolean; // toggle ElevenLabs neural vs browser TTS
}

export const DEFAULT_ELEVENLABS_SETTINGS: ElevenLabsSettings = {
  voiceId: 'lPHbLfNtSlP1adO8KMDI', // 3D Robo - custom neural voice
  modelId: 'eleven_turbo_v2_5',
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.0,
  useSpeakerBoost: true,
  enabled: true,
};

let audioContext: AudioContext | null = null;
let currentAudioElement: HTMLAudioElement | null = null;
let currentAnimFrame: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

/**
 * Fetch available ElevenLabs voices from the server proxy
 */
export async function fetchElevenLabsVoices(): Promise<{
  configured: boolean;
  defaultVoiceId: string;
  voices: ElevenLabsVoice[];
  message?: string;
}> {
  try {
    const res = await fetch('/api/ai/elevenlabs/voices');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to load ElevenLabs voices from API, using client fallback:', err);
    return {
      configured: false,
      defaultVoiceId: 'pNInz6obpgDQGcFmaJgB',
      voices: [
        {
          voice_id: 'pNInz6obpgDQGcFmaJgB',
          name: 'Adam',
          gender: 'Male',
          accent: 'American',
          category: 'premade',
          tag: 'Deep, Confident & Warm',
          description: 'Deep authoritative baritone, perfect for official campus advice and academic lectures.',
        },
        {
          voice_id: '21m00Tcm4TlvDq8ikWAM',
          name: 'Rachel',
          gender: 'Female',
          accent: 'American',
          category: 'premade',
          tag: 'Calm, Clear & Professional',
          description: 'Crisp, articulate and comforting female voice, ideal for student guidance.',
        },
        {
          voice_id: 'ErXwobaYiN019PkySvjV',
          name: 'Antoni',
          gender: 'Male',
          accent: 'American',
          category: 'premade',
          tag: 'Energetic, Friendly & Crisp',
          description: 'Youthful collegiate cadence with warm resonance and natural pronunciation.',
        },
        {
          voice_id: 'EXAVITQu4vr4xnSDxMaL',
          name: 'Bella',
          gender: 'Female',
          accent: 'American',
          category: 'premade',
          tag: 'Bright, Expressive & Lively',
          description: 'High emotional dynamism with vivid inflections for witty student interactions.',
        },
        {
          voice_id: 'yoZ06aMxZJJ28mfd3POQ',
          name: 'Sam',
          gender: 'Male',
          accent: 'American',
          category: 'premade',
          tag: 'Dynamic, Confident & Modern',
          description: 'Contemporary tech-focused tone, crisp diction and modern cadence.',
        },
      ],
    };
  }
}

/**
 * Call ElevenLabs TTS via server proxy
 */
export async function requestElevenLabsAudio(
  text: string,
  settings: ElevenLabsSettings
): Promise<{
  success: boolean;
  audioDataUrl?: string;
  fallback?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch('/api/ai/elevenlabs/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId: settings.voiceId,
        modelId: settings.modelId,
        stability: settings.stability,
        similarityBoost: settings.similarityBoost,
        style: settings.style,
        useSpeakerBoost: settings.useSpeakerBoost,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn('ElevenLabs request error:', err);
    return {
      success: false,
      fallback: true,
      error: err.message,
    };
  }
}

/**
 * Stop any active audio and lip-sync animation
 */
export function stopElevenLabsAudio() {
  if (currentAnimFrame) {
    cancelAnimationFrame(currentAnimFrame);
    currentAnimFrame = null;
  }
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
}

/**
 * Play synthesized audio with real-time Web Audio API lip-sync analyzer
 */
export function playAudioWithLipSync(
  audioUrl: string,
  callbacks: {
    onStart: () => void;
    onAmplitude: (volume: number) => void;
    onEnd: () => void;
    onError?: (error: any) => void;
  }
): HTMLAudioElement {
  stopElevenLabsAudio();

  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.src = audioUrl;
  currentAudioElement = audio;

  const ctx = getAudioContext();
  let source: MediaElementAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;

  try {
    source = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    source.connect(analyser);
    analyser.connect(ctx.destination);
  } catch (e) {
    // If element is already connected, fallback without re-routing
    console.warn('Web Audio node routing notice:', e);
  }

  const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 128);

  const monitorAmplitude = () => {
    if (!currentAudioElement || currentAudioElement.paused || currentAudioElement.ended) {
      callbacks.onAmplitude(0);
      return;
    }

    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      // Normalize to 0.0 - 1.0 with natural speech curve
      const normalized = Math.min(1.0, Math.max(0, avg / 128));
      callbacks.onAmplitude(normalized);
    } else {
      // Periodic oscillation fallback if analyser is unavailable
      callbacks.onAmplitude(0.35 + Math.random() * 0.45);
    }

    currentAnimFrame = requestAnimationFrame(monitorAmplitude);
  };

  audio.onplay = () => {
    callbacks.onStart();
    currentAnimFrame = requestAnimationFrame(monitorAmplitude);
  };

  audio.onended = () => {
    stopElevenLabsAudio();
    callbacks.onAmplitude(0);
    callbacks.onEnd();
  };

  audio.onerror = (e) => {
    stopElevenLabsAudio();
    callbacks.onAmplitude(0);
    if (callbacks.onError) callbacks.onError(e);
    callbacks.onEnd();
  };

  audio.play().catch((err) => {
    console.warn('Audio play request failed (user interaction required):', err);
    stopElevenLabsAudio();
    callbacks.onAmplitude(0);
    callbacks.onEnd();
  });

  return audio;
}
