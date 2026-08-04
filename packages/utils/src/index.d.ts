/**
 * Segment text into individual sentences with coordinate alignment info.
 * Accounts for abbreviations and edge cases in English.
 */
export declare function segmentIntoSentences(text: string): string[];
/**
 * Clean whitespace and format strings before embedding or TTS synthesis.
 */
export declare function cleanText(text: string): string;
/**
 * Estimates reading time based on an average words-per-minute speed.
 */
export declare function estimateReadingTime(wordsCount: number, wordsPerMinute?: number): {
    minutes: number;
    text: string;
};
/**
 * Helper to count words in a string block.
 */
export declare function countWords(text: string): number;
/**
 * Generates reading stats for visual reporting.
 */
export interface ReadingStats {
    totalWords: number;
    totalSentences: number;
    estimatedDurationSeconds: number;
}
export declare function calculateReadingStats(text: string, wordsPerMinute?: number): ReadingStats;
/**
 * Console log utility wrapper
 */
export declare const logger: {
    info: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
};
//# sourceMappingURL=index.d.ts.map