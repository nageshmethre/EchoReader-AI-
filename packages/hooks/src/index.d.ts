/**
 * Persists and state-syncs data inside LocalStorage.
 */
export declare function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void];
/**
 * Listens for keyboard key presses and fires callbacks.
 */
export declare function useKeyPress(targetKey: string, action: () => void, deps?: any[]): void;
/**
 * Orchestrates text-to-speech playing, skipping, and progress reporting.
 */
export interface UseTTSPlaybackOptions {
    sentences: string[];
    onSentenceChange?: (index: number) => void;
    onPlaybackEnd?: () => void;
    speed?: number;
}
export declare function useTTSPlayback({ sentences, onSentenceChange, onPlaybackEnd, speed }: UseTTSPlaybackOptions): {
    isPlaying: boolean;
    currentIndex: number;
    setCurrentIndex: (idx: number) => void;
    play: () => void;
    pause: () => void;
    stop: () => void;
    skipForward: () => void;
    skipBackward: () => void;
};
//# sourceMappingURL=index.d.ts.map