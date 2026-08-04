# EchoReader AI Architectural Design & "Brain" Log

This document explains the core technical decisions, data workflows, algorithms, and design choices structuring EchoReader AI.

---

## 1. Project Philosophy & Clean Architecture

EchoReader AI separates application concerns using Domain-Driven Design (DDD) principles:
- **Shared Packages Layer (`packages/*`)**: Contains zero-dependency TypeScript configurations, helper utilities, and React Hooks.
- **Core Services Layer (`services/*`)**: Self-contained business domains (Speech, OCR, AI, Search, Storage). They expose clean APIs, allowing us to swap internal engines (e.g. replacing Tesseract with PaddleOCR) without breaking upstream applications.
- **Client Applications Layer (`apps/*`)**: Framework consumers (Next.js and Electron) mapping user actions onto backend services.

---

## 2. Dynamic Audio-to-Text Synchronization (Speech Flow)

One of the premium features is the sentence follow-along highlighter.
To sync audio playback with text highlighting:

```
[Parsed Text Block] -> [Regex Segmenter] -> [Sentence Array]
                                                  |
[Speech Callback]   <- [Audio Synth Stream]   <- [Incremental Segment Feed]
        |
[Highlight Span ID] -> [CSS Highlight Class] -> [Scroll into View]
```

1. **Text Segmentation**: When a file is uploaded, the backend cleans whitespaces and segments text blocks into distinct sentences using a rule-based regex engine (`packages/utils`).
2. **Sequential Speech Generation**: Instead of synthesizing the entire book at once (which is expensive and introduces latency), the client retrieves the sentence array and requests speech buffers incrementally.
3. **Player Events**: The player uses the browser's native `SpeechSynthesisUtterance.onend` event or stream boundary markers to advance the sentence pointer (`currentIndex`).
4. **Visual Highlights**: A React state hook binds `currentIndex` to individual `<span>` tags, triggering smooth container scrolling and gold highlight classes.

---

## 3. Optical Character Recognition Flow

OCR parses layout flows from scanned files:
- **Image Scanning**: Tesseract.js worker pulls image buffers from files.
- **BBox Mapping**: Detects bounding boxes for paragraphs and lines.
- **Text Clean-up**: Strip hyphenations, headers, and footer notations before indexing.

---

## 4. AI & RAG pipeline (Retrieval-Augmented Generation)

To allow QA chatbot interactions with massive documents offline or in the cloud:

```
[Document Upload] -> [Text Segments] -> [Ollama/OpenAI Embeddings] -> [Vector Storage (Qdrant)]
                                                                               |
[User Chat Query] -> [Query Vector]  -> [Similarity Match (Cosine)]  <- [Top K Chunks]
                                                                               |
[RAG Prompt Assembly] -> [LLM Context Inference] -> [Answer Display]
```

1. **Chunking**: Text is chunked into 500-character blocks with 50-character overlaps.
2. **Embedding**: Chunks are processed into 1536-dimensional vectors using OpenAI's `text-embedding-3-small` or Ollama's `nomic-embed-text`.
3. **Storage**: Vector databases (Qdrant in production, local memory in desktop mode) store vectors mapping IDs back to document models.
4. **Query Retrieval**: The chat queries search using cosine similarity, extract the top 5 relevant text chunks, and inject them into the LLM system prompt as context.

---

## 5. Security & Isolation

- **Desktop Isolation**: Electron disables node integration in the renderer, locking access to standard web APIs, and routes file system reads securely using a context bridge (`preload.ts`).
- **REST Protection**: Fastify uses Helmet headers, CORS parameters, and rate-limits requests to mitigate SQL Injection, XSS, and CSRF attacks.
