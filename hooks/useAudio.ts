import { useState, useEffect, useCallback } from 'react';
import { audioEngine } from '../utils/AudioEngine';

export const useAudio = () => {
  const [isReady, setIsReady] = useState(false);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);

  useEffect(() => {
    // Check if context is already running (e.g., if it was already initialized)
    if (audioEngine.contextState === 'running') {
      setIsReady(true);
    }
  }, []);

  const init = useCallback(() => {
    audioEngine.ensureReady();
    setIsReady(true);
  }, []);

  const playNote = useCallback((note: string, duration?: number) => {
    audioEngine.playNote(note, duration);
  }, []);

  const stopNote = useCallback((note: string) => {
    audioEngine.stopNote(note);
  }, []);

  const playSequence = useCallback(async (notes: string[], bpm?: number, durations?: number[]) => {
    setIsPlayingSequence(true);
    try {
      await audioEngine.playSequence(notes, bpm, durations);
    } finally {
      setIsPlayingSequence(false);
    }
  }, []);

  const stopSequence = useCallback(() => {
    audioEngine.stopSequence();
    setIsPlayingSequence(false);
  }, []);

  return {
    isReady,
    init,
    playNote,
    stopNote,
    playSequence,
    stopSequence,
    isPlayingSequence,
    setVolume: useCallback((level: number) => audioEngine.setVolume(level), []),
    getVolume: useCallback(() => audioEngine.getVolume(), []),
  };
};
