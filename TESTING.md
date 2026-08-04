# Testing Guidelines

This document details testing strategies and runners configurations for EchoReader AI.

---

## 1. Quality Test Command

To run all unit tests across monorepo workspaces:

```bash
npm run test
```

---

## 2. Test Environments

- **Unit / Logic Tests**: Vitest runs package unit tests on helper operations (e.g. text segmenter tests).
- **Endpoint Tests**: Fastify integration tests audit route handlers and authentication scopes.
- **E2E Tests**: Playwright scripts simulate reader dashboard actions, highlight adjustments, and chat answers.
