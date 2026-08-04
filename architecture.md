# EchoReader AI System Architecture

This document describes the architectural layout, components, and data sequences of EchoReader AI.

---

## 1. System Component Layout

```mermaid
graph TD
    subgraph Client Applications
        A[Next.js Web Client]
        B[Electron Desktop App]
    end

    subgraph API Layer
        C[Fastify API Gateway]
    end

    subgraph Core Services
        D[Auth Service]
        E[Storage Adapter]
        F[OCR Engine]
        G[TTS Synthesizer]
        H[AI RAG Model Orchestrator]
        I[Meilisearch / Fuse.js]
    end

    subgraph Data Layer
        J[(PostgreSQL DB)]
        K[(Redis Cache)]
        L[(Qdrant Vector DB)]
    end

    A -->|REST API| C
    B -->|REST API / Offline| C
    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    C --> I
    D --> J
    E --> J
    H --> L
    H --> J
    C --> K
```

---

## 2. Document Processing Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Client Application
    participant Server as Fastify API
    participant Storage as S3 Storage
    participant OCR as OCR Service
    participant Embed as AI Embedding
    participant DB as Postgres Database

    User->>Client: Drag & Drop Document
    Client->>Server: POST /api/documents/upload (Multipart)
    Server->>Storage: uploadFile(buffer)
    Storage-->>Server: File URL pointer
    Server->>OCR: performOCR(fileBuffer)
    OCR-->>Server: Extracted Clean Text
    Server->>Embed: generateEmbeddings(chunks)
    Embed-->>Server: Float Vectors List
    Server->>DB: Save Document Record & Chunks
    DB-->>Server: Confirm write
    Server-->>Client: Return Doc ID & Status
    Client-->>User: Render document interface
```

---

## 3. Speech Playback Event Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Synthesizing : Click Play
    Synthesizing --> Playing : Audio Buffer Ready
    Playing --> HighlightSentence : On Sentence Audio Boundary
    HighlightSentence --> ScrollContainer : AutoScroll enabled
    Playing --> Paused : Click Pause
    Paused --> Playing : Click Resume
    Playing --> Idle : Audio Finish / Click Stop
```
