# Installation Guide

Follow these steps to install and compile EchoReader AI on your local machine.

---

## 1. System Requirements

- **Node.js**: Version `24.x` or higher.
- **npm**: Version `11.x` or higher.
- **Database**: PostgreSQL (or local SQLite fallback).
- **Optional Cache**: Redis.
- **Docker**: For containerized deployment setups.

---

## 2. Standard Installation

```bash
# Clone the repository
git clone https://github.com/nageshmethre/EchoReader-AI-.git
cd EchoReader-AI-

# Install monorepo dependencies
npm install

# Setup env configs
cp .env.example .env

# Generate Prisma Client models
npm run db:generate

# Build all packages and applications
npm run build
```

---

## 3. Desktop Application Run

To compile and launch the Electron application locally:

```bash
cd apps/desktop
npm run dev
```
