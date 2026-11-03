/**
 * useSpeechSignals — ref-based signal store for per-frame speech data.
 *
 * WHY: speechVolume and lipSyncViseme previously lived in React state, causing
 * the entire 2500-line CampusAIAssistant to re-render every 100ms while the robot
 * was speaking. Moving them to a mutable singleton + useSyncExternalStore lets
 * Avatar3DCanvas read them via the ref directly (zero React renders) while the
 * Debug HUD and waveform bar can still subscribe reactively.
 *
 * USAGE:
 *   // In the parent component (CampusAIAssistant):
 *   const signals = useSpeechSignals();
 *   signals.setVolume(amp);        // replaces setSpeechVolume(amp)
 *   signals.setViseme('viseme_a'); // replaces setLipSyncViseme(...)
 *
 *   // In Avatar3DCanvas (no React renders, reads ref directly):
 *   props.speechSignals.volumeRef.current // 0..1
 *
 *   // For reactive UI (Debug HUD, waveform):
 *   const { volume, viseme } = useSpeechSignalsSnapshot();
 */

import { useRef, useCallback, useSyncExternalStore } from 'react';

export type Viseme = 'idle' | 'viseme_a' | 'viseme_e' | 'viseme_o' | 'speaking';

interface SpeechStore {
  volume: number;
  viseme: Viseme;
}

type Listener = () => void;

class SpeechSignalStore {
  private _volume = 0;
  private _viseme: Viseme = 'idle';
  private _listeners = new Set<Listener>();

  get volumeRef() { return { current: this._volume }; }

  getSnapshot(): SpeechStore {
    return { volume: this._volume, viseme: this._viseme };
  }

  setVolume(v: number) {
    this._volume = v;
    this._notify();
  }

  setViseme(vis: Viseme) {
    this._viseme = vis;
    this._notify();
  }

  subscribe(fn: Listener) {
    this._listeners.add(fn);
    return () => { this._listeners.delete(fn); };
  }

  private _notify() {
    this._listeners.forEach(fn => fn());
  }
}

/** Module-level singleton so all consumers share the same store instance */
export const speechStore = new SpeechSignalStore();

/**
 * Hook for the *writer* (CampusAIAssistant).
 * Returns stable callbacks that mutate the store without causing React re-renders.
 */
export function useSpeechSignals() {
  const volumeRef = useRef(0);
  const visemeRef = useRef<Viseme>('idle');

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
    speechStore.setVolume(v);
  }, []);

  const setViseme = useCallback((vis: Viseme) => {
    visemeRef.current = vis;
    speechStore.setViseme(vis);
  }, []);

  const reset = useCallback(() => {
    setVolume(0);
    setViseme('idle');
  }, [setVolume, setViseme]);

  return { volumeRef, visemeRef, setVolume, setViseme, reset };
}

/**
 * Hook for *reactive* consumers (Debug HUD, waveform bar).
 * Subscribes to the store; causes those components to re-render on speech changes
 * but does NOT affect the main CampusAIAssistant render tree.
 */
export function useSpeechSignalsSnapshot(): SpeechStore {
  return useSyncExternalStore(
    (fn) => speechStore.subscribe(fn),
    () => speechStore.getSnapshot(),
    () => ({ volume: 0, viseme: 'idle' as Viseme }),
  );
}
