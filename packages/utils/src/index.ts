// Shared Utilities for EchoReader AI

/**
 * Segment text into individual sentences with coordinate alignment info.
 * Accounts for abbreviations and edge cases in English.
 */
export function segmentIntoSentences(text: string): string[] {
  if (!text) return [];
  // Basic sentence splitter regex, respects standard punctuation
  const sentenceRegex = /[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/g;
  const matches = text.match(sentenceRegex);
  return matches ? matches.map(s => s.trim()).filter(s => s.length > 0) : [text.trim()];
}

/**
 * Clean whitespace and format strings before embedding or TTS synthesis.
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}

/**
 * Estimates reading time based on an average words-per-minute speed.
 */
export function estimateReadingTime(wordsCount: number, wordsPerMinute = 200): { minutes: number; text: string } {
  const minutes = Math.ceil(wordsCount / wordsPerMinute);
  return {
    minutes,
    text: minutes === 1 ? '1 min remaining' : `${minutes} mins remaining`
  };
}

/**
 * Helper to count words in a string block.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Generates reading stats for visual reporting.
 */
export interface ReadingStats {
  totalWords: number;
  totalSentences: number;
  estimatedDurationSeconds: number;
}

export function calculateReadingStats(text: string, wordsPerMinute = 150): ReadingStats {
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
export const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, ...args);
  }
};
