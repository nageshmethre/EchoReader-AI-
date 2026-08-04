# Environment and Database Setup Guide

This document describes the environment keys configuration and database migration tasks.

---

## 1. Environment Keys

Generate a local `.env` file at the root containing:
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Custom private string for sign validation.
- `GEMINI_API_KEY`: API key for Google Gemini model.
- `OPENAI_API_KEY`: API key for OpenAI GPT and Embeddings model.
- `OLLAMA_HOST`: Local Ollama container connection string.

---

## 2. Relational Migrations

Prisma automatically applies schemas to database clusters.

```bash
# Push schema updates directly (development environment)
npm run db:push

# Generate new Prisma schemas types
npm run db:generate

# Execute project db seeder
npm run db:seed
```
