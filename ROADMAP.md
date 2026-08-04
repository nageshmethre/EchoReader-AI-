# EchoReader AI Project Roadmap

This roadmap details key development phases, feature releases, and milestones for the EchoReader AI application.

---

## Phase 1: MVP & Core Infrastructure (Completed)
- [x] Monorepo structure setup (`package.json`, workspaces).
- [x] Core TypeScript typing interfaces and utility libraries.
- [x] Prisma database schema configuration.
- [x] Standard storage providers (local and S3 compatibility).
- [x] Fastify API Gateway skeleton.

## Phase 2: Speech & Reader Integration (Current)
- [x] Sentence highlighter segmentation algorithms.
- [x] Responsive layout reader pane with autoscroll sync.
- [x] Multi-provider Speech adapters (Azure, OpenAI, ElevenLabs).
- [x] Local client voice synthesis fallbacks.
- [x] Keyboard shortcuts hookups.

## Phase 3: AI Chat & OCR Enhancements (Q3 2026)
- [ ] Direct vector database integration (Qdrant client queries).
- [ ] Offline local embeddings execution via local libraries.
- [ ] Scanned PDF table structures recognition.
- [ ] Deep equation detections and footnote filters.

## Phase 4: Production Release & Deployments (Q4 2026)
- [ ] Docker Compose production-grade scaling files.
- [ ] Auto-updater setup on Electron applications.
- [ ] Mobile application wrapper (optional).
