"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocalStorage = useLocalStorage;
exports.useKeyPress = useKeyPress;
exports.useTTSPlayback = useTTSPlayback;
const react_1 = require("react");
/**
 * Persists and state-syncs data inside LocalStorage.
 */
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = (0, react_1.useState)(() => {
        try {
            if (typeof window === 'undefined')
                return initialValue;
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            console.error(error);
            return initialValue;
        }
    });
    const setValue = (0, react_1.useCallback)((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        }
        catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);
    return [storedValue, setValue];
}
/**
 * Listens for keyboard key presses and fires callbacks.
 */
function useKeyPress(targetKey, action, deps = []) {
    (0, react_1.useEffect)(() => {
        const downHandler = (e) => {
            // Check if user is typing in input or textarea
            const target = e.target;
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
function useTTSPlayback({ sentences, onSentenceChange, onPlaybackEnd, speed = 1.0 }) {
    const [isPlaying, setIsPlaying] = (0, react_1.useState)(false);
    const [currentIndex, setCurrentIndex] = (0, react_1.useState)(0);
    const utteranceRef = (0, react_1.useRef)(null);
    // Synchronize state and trigger changes
    (0, react_1.useEffect)(() => {
        if (onSentenceChange) {
            onSentenceChange(currentIndex);
        }
    }, [currentIndex, onSentenceChange]);
    const stop = (0, react_1.useCallback)(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
    }, []);
    const pause = (0, react_1.useCallback)(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.pause();
        }
        setIsPlaying(false);
    }, []);
    const playSentence = (0, react_1.useCallback)((index) => {
        if (typeof window === 'undefined' || !window.speechSynthesis || sentences.length === 0)
            return;
        window.speechSynthesis.cancel();
        if (index >= sentences.length) {
            setCurrentIndex(0);
            setIsPlaying(false);
            if (onPlaybackEnd)
                onPlaybackEnd();
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
                }
                else {
                    setIsPlaying(false);
                    if (onPlaybackEnd)
                        onPlaybackEnd();
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
    const resume = (0, react_1.useCallback)(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis)
            return;
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
        }
        else {
            playSentence(currentIndex);
        }
    }, [currentIndex, playSentence]);
    const skipForward = (0, react_1.useCallback)(() => {
        const nextIndex = Math.min(currentIndex + 1, sentences.length - 1);
        if (nextIndex !== currentIndex) {
            setCurrentIndex(nextIndex);
            if (isPlaying) {
                playSentence(nextIndex);
            }
        }
    }, [currentIndex, sentences.length, isPlaying, playSentence]);
    const skipBackward = (0, react_1.useCallback)(() => {
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
        setCurrentIndex: (idx) => {
            setCurrentIndex(idx);
            if (isPlaying)
                playSentence(idx);
        },
        play: resume,
        pause,
        stop,
        skipForward,
        skipBackward
    };
}
//# sourceMappingURL=index.js.map