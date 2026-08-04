import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Persists and state-syncs data inside LocalStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * Listens for keyboard key presses and fires callbacks.
 */
export function useKeyPress(targetKey: string, action: () => void, deps: any[] = []) {
  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      // Check if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.key === targetKey) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', downHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
    };
  }, [targetKey, action, ...deps]);
}

/**
 * Orchestrates text-to-speech playing, skipping, and progress reporting.
 */
export interface UseTTSPlaybackOptions {
  sentences: string[];
  onSentenceChange?: (index: number) => void;
  onPlaybackEnd?: () => void;
  speed?: number;
}

export function useTTSPlayback({
  sentences,
  onSentenceChange,
  onPlaybackEnd,
  speed = 1.0
}: UseTTSPlaybackOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Synchronize state and trigger changes
  useEffect(() => {
    if (onSentenceChange) {
      onSentenceChange(currentIndex);
    }
  }, [currentIndex, onSentenceChange]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
  }, []);

  const playSentence = useCallback((index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || sentences.length === 0) return;

    window.speechSynthesis.cancel();

    if (index >= sentences.length) {
      setCurrentIndex(0);
      setIsPlaying(false);
      if (onPlaybackEnd) onPlaybackEnd();
      return;
    }

    const textToSpeak = sentences[index];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speed;
    utteranceRef.current = utterance;

    utterance.onend = () => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next < sentences.length) {
          playSentence(next);
          return next;
        } else {
          setIsPlaying(false);
          if (onPlaybackEnd) onPlaybackEnd();
          return 0;
        }
      });
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.error('SpeechSynthesis error:', e);
        setIsPlaying(false);
      }
    };

    window.speechSynthesis.speak(utterance);
    setCurrentIndex(index);
    setIsPlaying(true);
  }, [sentences, speed, onPlaybackEnd]);

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else {
      playSentence(currentIndex);
    }
  }, [currentIndex, playSentence]);

  const skipForward = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, sentences.length - 1);
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
      if (isPlaying) {
        playSentence(nextIndex);
      }
    }
  }, [currentIndex, sentences.length, isPlaying, playSentence]);

  const skipBackward = useCallback(() => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex !== currentIndex) {
      setCurrentIndex(prevIndex);
      if (isPlaying) {
        playSentence(prevIndex);
      }
    }
  }, [currentIndex, isPlaying, playSentence]);

  return {
    isPlaying,
    currentIndex,
    setCurrentIndex: (idx: number) => {
      setCurrentIndex(idx);
      if (isPlaying) playSentence(idx);
    },
    play: resume,
    pause,
    stop,
    skipForward,
    skipBackward
  };
}
