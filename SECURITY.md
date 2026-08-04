# Security Policy & Guidelines

This document outlines key security designs integrated into EchoReader AI.

---

## 1. Rate Limiting

The Fastify server implements rate limiting:
- Limit: Max 100 requests per minute per IP address.
- Headers: Standard rate limit responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`).

---

## 2. Cross-Site Protection

- **Helmet**: Registers security headers to shield the backend against clickjacking, mime sniffing, and cross-site scripting (XSS) vectors.
- **CORS**: Explicit origins checks prevent unauthorized requests from loading API contents.
- **Electron Isolation**: Direct access to local filesystem APIs is restricted to preloaded context bridges. Node integration is disabled in the renderer thread.

---

## 3. Data Protection

- **Bcrypt**: All user credentials are encrypted with a work factor of 10.
- **Prisma SQL Sanitization**: Prisma automatically parameterizes inputs to safeguard database transactions from injection attempts.
