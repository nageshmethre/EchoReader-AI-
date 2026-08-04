import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { hashPassword, verifyPassword, generateToken } from '@echoreader/auth';
import { getStorageProvider } from '@echoreader/storage';
import { performOCR, cleanOCROutput } from '@echoreader/ocr';
import { getSearchAdapter } from '@echoreader/search';
import { generateSpeechAudio } from '@echoreader/speech';
import { generateSummary, translateText, queryDocumentRAG } from '@echoreader/ai';
import { segmentIntoSentences, cleanText, calculateReadingStats } from '@echoreader/utils';

// Load environment configurations
dotenv.config();

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();
const storage = getStorageProvider();
const searchAdapter = getSearchAdapter();

// Register Security & Cross-Origin Middleware
fastify.register(cors, { origin: '*' });
fastify.register(helmet);
fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' });
fastify.register(jwt, { secret: process.env.JWT_SECRET || 'secret_key_12345' });
fastify.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Authentication Middleware Hook
fastify.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized credentials' });
  }
});

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'healthy', timestamp: new Date() };
});

// ----------------------------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------------------------
fastify.post('/api/auth/register', async (request: any, reply) => {
  const { email, password, name } = request.body;
  if (!email || !password) {
    return reply.status(400).send({ error: 'Email and password required' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return reply.status(409).send({ error: 'Email already registered' });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      settings: {
        create: {
          theme: 'dark',
          defaultVoice: 'local-en',
        }
      }
    }
  });

  const token = generateToken({ userId: user.id, email: user.email });
  return { user: { id: user.id, email: user.email, name: user.name }, token };
});

fastify.post('/api/auth/login', async (request: any, reply) => {
  const { email, password } = request.body;
  if (!email || !password) {
    return reply.status(400).send({ error: 'Email and password required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  const token = generateToken({ userId: user.id, email: user.email });
  return { user: { id: user.id, email: user.email, name: user.name }, token };
});

// ----------------------------------------------------------------------
// DOCUMENT ACTIONS
// ----------------------------------------------------------------------
fastify.post('/api/documents/upload', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const data = await request.file();
  if (!data) {
    return reply.status(400).send({ error: 'No file uploaded' });
  }

  const user = request.user;
  const fileName = data.filename;
  const mimeType = data.mimetype;
  const buffer = await data.toBuffer();
  
  const fileKey = `uploads/${user.userId}/${Date.now()}_${fileName}`;
  
  // Save to storage engine
  const fileUrl = await storage.uploadFile(fileKey, buffer, mimeType);

  let extractedText = '';

  // Simple text extraction / OCR fallback
  if (mimeType.startsWith('image/') || fileName.endsWith('.png') || fileName.endsWith('.jpg')) {
    const ocrResult = await performOCR(buffer);
    extractedText = cleanOCROutput(ocrResult.text);
  } else {
    // If text files, parse directly.
    extractedText = buffer.toString('utf-8');
  }

  extractedText = cleanText(extractedText) || 'No text extracted.';

  // Create Document record
  const document = await prisma.document.create({
    data: {
      userId: user.userId,
      title: fileName,
      fileKey: fileKey,
      fileSize: buffer.length,
      fileType: fileName.split('.').pop() || 'txt',
      parsedText: extractedText,
    }
  });

  // Split into sentences and create chunks for semantic search
  const sentences = segmentIntoSentences(extractedText);
  const searchChunks: any[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const chunk = await prisma.documentChunk.create({
      data: {
        documentId: document.id,
        pageIndex: 0,
        paragraphIndex: Math.floor(i / 5), // Group every 5 sentences into a mock paragraph
        sentenceIndex: i % 5,
        content: sentence,
        wordCount: sentence.split(/\s+/).length,
      }
    });

    searchChunks.push({
      id: chunk.id,
      documentId: document.id,
      pageIndex: 0,
      paragraphIndex: Math.floor(i / 5),
      text: sentence
    });
  }

  // Index search contents
  try {
    await searchAdapter.indexDocumentChunks(document.id, searchChunks);
  } catch (err) {
    fastify.log.warn('Could not index chunks to search server:', err);
  }

  return { document, totalSentences: sentences.length };
});

fastify.get('/api/documents', { preValidation: [(fastify as any).authenticate] }, async (request: any) => {
  const user = request.user;
  return prisma.document.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' }
  });
});

fastify.get('/api/documents/:id', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const { id } = request.params;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { chunks: { orderBy: { id: 'asc' } } }
  });

  if (!doc) {
    return reply.status(404).send({ error: 'Document not found' });
  }

  const sentences = doc.chunks.map(c => c.content);
  const stats = calculateReadingStats(doc.parsedText || '');

  return {
    document: {
      id: doc.id,
      title: doc.title,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      summary: doc.summary,
      createdAt: doc.createdAt
    },
    sentences,
    stats
  };
});

// ----------------------------------------------------------------------
// TEXT-TO-SPEECH STREAM GENERATOR
// ----------------------------------------------------------------------
fastify.post('/api/documents/:id/speech', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const { text, provider, voiceId, speed } = request.body;
  if (!text) {
    return reply.status(400).send({ error: 'Text content to synthesize required' });
  }

  try {
    const audioBuffer = await generateSpeechAudio(text, {
      provider: provider || 'local',
      voiceId: voiceId || 'alloy',
      speed: speed ? parseFloat(speed) : 1.0,
      pitch: 0,
    });

    reply.type('audio/mpeg').send(audioBuffer);
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
});

// ----------------------------------------------------------------------
// AI CHAT & RAG SERVICES
// ----------------------------------------------------------------------
fastify.post('/api/documents/:id/chat', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const { id } = request.params;
  const { message, history, provider } = request.body;
  if (!message) {
    return reply.status(400).send({ error: 'Message query required' });
  }

  // Retrieve relevant document context
  const chunks = await prisma.documentChunk.findMany({
    where: { documentId: id },
    take: 5 // Get first 5 chunks as context. (In fully enabled RAG, query database using vector math)
  });

  const contextTexts = chunks.map(c => c.content);
  
  try {
    const aiResponse = await queryDocumentRAG(message, contextTexts, history || [], provider || 'gemini');
    return { response: aiResponse };
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
});

fastify.post('/api/documents/:id/summary', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const { id } = request.params;
  const { provider } = request.body;
  
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || !doc.parsedText) {
    return reply.status(404).send({ error: 'Document has no text to summarize' });
  }

  try {
    const summary = await generateSummary(doc.parsedText, provider || 'gemini');
    
    // Save generated summary
    await prisma.document.update({
      where: { id },
      data: { summary }
    });

    return { summary };
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
});

// Start Fastify Listening Process
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server runs on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
