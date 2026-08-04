# EchoReader AI REST API Specifications

This document outlines the API endpoints, request schemas, and expected responses for the Fastify server.

---

## 1. Authentication Endpoints

### Register a User
- **Endpoint**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password",
    "name": "Jane Doe"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "u-12345",
      "email": "user@example.com",
      "name": "Jane Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## 2. Document Endpoints

### Upload Document
- **Endpoint**: `POST /api/documents/upload`
- **Headers**: `Authorization: Bearer <JWT>`, `Content-Type: multipart/form-data`
- **Payload**: File binary mapping (under key name `file`).
- **Response (200 OK)**:
  ```json
  {
    "document": {
      "id": "doc-67890",
      "title": "financial_report.pdf",
      "fileType": "pdf",
      "fileSize": 2048576,
      "createdAt": "2026-08-05T01:00:00.000Z"
    },
    "totalSentences": 450
  }
  ```

---

## 3. Playback & TTS Endpoints

### Generate Speech Audio
- **Endpoint**: `POST /api/documents/:id/speech`
- **Headers**: `Authorization: Bearer <JWT>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "text": "The quick brown fox jumps over the lazy dog.",
    "provider": "openai",
    "voiceId": "alloy",
    "speed": "1.0"
  }
  ```
- **Response (200 OK)**:
  - Content-Type: `audio/mpeg` (Binary audio stream).
