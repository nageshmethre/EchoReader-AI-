# Coding Style & Architecture Guidelines

Follow these specifications to write standard codebase structures:

---

## 1. Naming Conventions

- **React Components**: PascalCase (e.g. `FloatingPlayer.tsx`).
- **Files / Folders**: kebab-case (e.g. `tsconfig.json`, `schema.prisma`).
- **TypeScript interfaces**: Prefix or write clean nouns (e.g. `interface PlaybackState`).

---

## 2. Shared Libraries Isolation

Import packages layers using alias references from the monorepo workspace rather than absolute paths:
- Direct imports: `import { cn } from '@echoreader/ui';`
- Direct hooks: `import { useLocalStorage } from '@echoreader/hooks';`

---

## 3. SOLID Principles

Ensure functions handle a single concern. For example:
- Storage provider handles upload formats, not OCR text cleaning.
- OCR service scans images, passing results downstream.
- Utilities segment sentences, separate from players.
