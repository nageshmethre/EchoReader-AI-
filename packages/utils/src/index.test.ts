import { describe, it, expect } from 'vitest';
import { segmentIntoSentences, cleanText, estimateReadingTime, calculateReadingStats } from './index.js';

describe('Text Cleaning and Normalization Utilities', () => {
  it('should clean multiple spaces and replace unicode curly quotes', () => {
    const raw = '  This is  a  test   with \u201ccurly\u201d quotes.  ';
    const cleaned = cleanText(raw);
    expect(cleaned).toBe('This is a test with "curly" quotes.');
  });
});

describe('Sentence Segmenter Utilities', () => {
  it('should segment text into clean separate sentences', () => {
    const text = 'Welcome to EchoReader AI. This is a text-to-speech reader monorepo! Enjoy your stay? Let us test it.';
    const sentences = segmentIntoSentences(text);
    expect(sentences).toHaveLength(4);
    expect(sentences[0]).toBe('Welcome to EchoReader AI.');
    expect(sentences[1]).toBe('This is a text-to-speech reader monorepo!');
    expect(sentences[2]).toBe('Enjoy your stay?');
    expect(sentences[3]).toBe('Let us test it.');
  });

  it('should return empty list for empty strings', () => {
    expect(segmentIntoSentences('')).toEqual([]);
  });
});

describe('Read Duration Estimators', () => {
  it('should estimate reading time duration in minutes', () => {
    const { minutes, text } = estimateReadingTime(450); // 450 words at 200 WPM
    expect(minutes).toBe(3);
    expect(text).toBe('3 mins remaining');
  });

  it('should estimate single minute remaining correctly', () => {
    const { minutes, text } = estimateReadingTime(150);
    expect(minutes).toBe(1);
    expect(text).toBe('1 min remaining');
  });

  it('should calculate complete reading stats', () => {
    const text = 'The quick brown fox jumps over the lazy dog. Twice!';
    const stats = calculateReadingStats(text, 100); // 10 words, 2 sentences
    expect(stats.totalWords).toBe(10);
    expect(stats.totalSentences).toBe(2);
    expect(stats.estimatedDurationSeconds).toBe(6); // (10 words / 100 WPM) * 60 = 6s
  });
});
