// Shared Core Types for EchoReader AI

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthAccount {
  id: string;
  provider: 'google' | 'github';
  providerId: string;
  userId: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

// Document Models
export interface Document {
  id: string;
  userId?: string;
  title: string;
  fileKey: string; // Storage pointer
  fileSize: number;
  fileType: string; // pdf, docx, txt, epub, etc.
  createdAt: Date;
  updatedAt: Date;
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  author?: string;
  subject?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  summary?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  pageIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;
  content: string;
  wordCount: number;
}

// Playback and Synchronization
export interface PlaybackState {
  id: string;
  userId: string;
  documentId: string;
  pageIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;
  characterOffset: number;
  playbackSpeed: number;
  voiceId: string;
  volume: number;
  updatedAt: Date;
}

export interface Bookmark {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  pageIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;
  createdAt: Date;
}

// Text-to-Speech Settings
export type SpeechProviderType = 'azure' | 'google' | 'polly' | 'elevenlabs' | 'openai' | 'coqui' | 'local';

export interface TTSVoice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent?: string;
  language: string;
  provider: SpeechProviderType;
  supportedEmotions?: string[];
}

export interface TTSConfig {
  provider: SpeechProviderType;
  voiceId: string;
  speed: number; // 0.5 to 3.0
  pitch: number; // -20 to 20 or multiplier
  emotion?: string;
  gender?: 'male' | 'female' | 'neutral';
  accent?: string;
  pauseLength: number; // in milliseconds
  autoScroll: boolean;
  highlightLevel: 'sentence' | 'paragraph';
  theme: 'light' | 'dark' | 'sepia';
}

// AI and RAG Types
export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  createdAt: Date;
  messages?: Message[];
}

export interface SemanticQueryResult {
  chunkId: string;
  content: string;
  pageIndex: number;
  score: number;
}

// OCR Types
export interface OCRResult {
  text: string;
  confidence: number;
  pages: OCRPage[];
}

export interface OCRPage {
  pageNumber: number;
  width: number;
  height: number;
  paragraphs: OCRParagraph[];
}

export interface OCRParagraph {
  text: string;
  boundingBox: [number, number, number, number]; // [x, y, width, height]
  confidence: number;
}

// Search schemas
export interface SearchHit {
  documentId: string;
  chunkId: string;
  pageIndex: number;
  paragraphIndex: number;
  text: string;
  snippet: string;
  score?: number;
}

export interface SearchResponse {
  hits: SearchHit[];
  total: number;
  timeMs: number;
}
