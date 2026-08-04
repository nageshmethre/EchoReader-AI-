# EchoReader AI

EchoReader AI is a production-grade, enterprise-ready, cross-platform Document Reader that parses local or uploaded documents, processes layout segmentation via optical character recognition, transforms text into natural speech with word-level highlight synchronization, and hosts an intelligent Retrieval-Augmented Generation (RAG) assistant.

## Features

- **Multi-Format Uploads**: Support for PDF, DOCX, PPTX, TXT, RTF, Markdown, HTML, CSV, Excel, and EPUB.
- **Natural Voice Playback**: Sentence-by-sentence reading with play, pause, resume, and skip controls. Supports OpenAI TTS, Azure, and ElevenLabs.
- **Visual Follow-Along**: Auto-scrolling and real-time visual highlight tracking on active read segments.
- **Document Chat & RAG**: Semantic queries, page summaries, and text translations powered by Gemini, OpenAI, and local Ollama/Llama.cpp.
- **Optical Character Recognition**: Local scanned document OCR using Tesseract.js.
- **Cross-Platform Access**: Native Electron client for Windows/macOS/Linux alongside a dynamic Next.js Web Client.

---

## Workspace Folder Structure

```
EchoReader-AI/
├── apps/
│   ├── web/               # Next.js React Web Client (Tailwind, TypeScript)
│   ├── desktop/           # Electron + React + Vite + TS (Desktop Client)
├── services/
│   ├── api/               # Fastify main API service
│   ├── ai/                # AI & RAG service adapter (Gemini, OpenAI, Ollama)
│   ├── speech/            # Text-to-Speech orchestration service (Azure, ElevenLabs, OpenAI)
│   ├── ocr/               # OCR document text extraction service (Tesseract.js)
│   ├── auth/              # JWT & OAuth helper service module
│   ├── search/            # Meilisearch and Fuse.js search adapter
│   ├── storage/           # S3-compatible and local file storage service
├── packages/
│   ├── ui/                # Tailwind CSS shared components
│   ├── types/             # Shared TypeScript typings
│   ├── hooks/             # Shared React hooks (audio, bookmarks, settings)
│   ├── utils/             # Loggers, parsing, validators
│   ├── config/            # Base configurations
├── database/
│   ├── schema.prisma      # PostgreSQL Prisma Schema
│   └── seed.ts            # Prisma database seed script
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
├── docs/                  # Project specifications and details
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v24.x` or higher
- **npm**: `v11.x` or higher
- **Docker & Docker Compose**: (Optional, for service containers)

### Initial Installation

Clone the repository and run dependencies setup at the root:

```bash
# Install all package and workspace dependencies
npm install

# Build shared config and helper libraries
npm run build
```

---

## Running in Development

### 1. Database Setup

Ensure PostgreSQL is running locally or start the docker container, then execute schema push:

```bash
# Push database schemas
npm run db:push

# Populate database with seeds
npm run db:seed
```

### 2. Launching Services and Apps

To start the API backend server alongside the Next.js web client concurrently:

```bash
# Start Fastify and Next.js hot-reload dev servers
npm run dev
```

### 3. Launching Desktop Electron Client

Move to the desktop directory and start the Vite renderer with Electron:

```bash
cd apps/desktop
npm run dev
```

---

## Production Build & Containerization

### Docker Deployment

To launch PostgreSQL, Redis, Qdrant, Meilisearch, the Fastify API, and the Next.js Web app combined:

```bash
docker-compose up --build -d
```

---

## Documentation Index

For exhaustive developer guidelines and technical architectures, please review:
- [brain.md](file:///c:/Users/Nagesh/Downloads/audiobbok%20web%20app/brain.md) - Project thinking, pipelines, flows.
- [architecture.md](file:///c:/Users/Nagesh/Downloads/audiobbok%20web%20app/architecture.md) - Deep architectural diagrams.
- [INSTALL.md](file:///c:/Users/Nagesh/Downloads/audiobbok%20web%20app/INSTALL.md) - Step-by-step installation instructions.
- [DEPLOYMENT.md](file:///c:/Users/Nagesh/Downloads/audiobbok%20web%20app/DEPLOYMENT.md) - Cloud hosting strategies.
- [ROADMAP.md](file:///c:/Users/Nagesh/Downloads/audiobbok%20web%20app/ROADMAP.md) - Milestone schedules.

---

## License

This project is licensed under the MIT License - see [LICENSE.md](file:///c:/Users/Nagesh/Downloads/audiobbok%20web%20app/LICENSE.md) for details.
