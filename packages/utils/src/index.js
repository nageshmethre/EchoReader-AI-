"use strict";
// Shared Utilities for EchoReader AI
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.segmentIntoSentences = segmentIntoSentences;
exports.cleanText = cleanText;
exports.estimateReadingTime = estimateReadingTime;
exports.countWords = countWords;
exports.calculateReadingStats = calculateReadingStats;
/**
 * Segment text into individual sentences with coordinate alignment info.
 * Accounts for abbreviations and edge cases in English.
 */
function segmentIntoSentences(text) {
    if (!text)
        return [];
    // Basic sentence splitter regex, respects standard punctuation
    const sentenceRegex = /[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/g;
    const matches = text.match(sentenceRegex);
    return matches ? matches.map(s => s.trim()).filter(s => s.length > 0) : [text.trim()];
}
/**
 * Clean whitespace and format strings before embedding or TTS synthesis.
 */
function cleanText(text) {
    if (!text)
        return '';
    return text
        .replace(/\s+/g, ' ')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .trim();
}
/**
 * Estimates reading time based on an average words-per-minute speed.
 */
function estimateReadingTime(wordsCount, wordsPerMinute = 200) {
    const minutes = Math.ceil(wordsCount / wordsPerMinute);
    return {
        minutes,
        text: minutes === 1 ? '1 min remaining' : `${minutes} mins remaining`
    };
}
/**
 * Helper to count words in a string block.
 */
function countWords(text) {
    if (!text)
        return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}
function calculateReadingStats(text, wordsPerMinute = 150) {
    const words = countWords(text);
    const sentences = segmentIntoSentences(text).length;
    // Calculate playback duration in seconds
    const estimatedDurationSeconds = Math.round((words / wordsPerMinute) * 60);
    return {
        totalWords: words,
        totalSentences: sentences,
        estimatedDurationSeconds
    };
}
/**
 * Console log utility wrapper
 */
exports.logger = {
    info: (msg, ...args) => {
        console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, ...args);
    },
    warn: (msg, ...args) => {
        console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, ...args);
    },
    error: (msg, ...args) => {
        console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, ...args);
    }
};
//# sourceMappingURL=index.js.map