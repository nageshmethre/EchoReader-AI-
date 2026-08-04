import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Performs optical character recognition on an image buffer.
 * Supports languages like English, Spanish, French, German, etc.
 */
export async function performOCR(imageBuffer: Buffer, language = 'eng'): Promise<OCRResult> {
  const worker = await createWorker(language);
  try {
    const { data } = await worker.recognize(imageBuffer);
    return {
      text: data.text,
      confidence: data.confidence
    };
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error('Failed to extract text using OCR engine');
  } finally {
    await worker.terminate();
  }
}

/**
 * Clean layout lines, equations, or headers extracted by OCR
 */
export function cleanOCROutput(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}
