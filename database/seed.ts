import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Create Demo User
  const user = await prisma.user.upsert({
    where: { email: 'demo@echoreader.ai' },
    update: {},
    create: {
      email: 'demo@echoreader.ai',
      name: 'EchoReader Demo User',
      passwordHash: '$2b$10$pLw521F3H1C1wY1E1q2v1.aGfS520H2P4C.eB8n2c2w9O41A1a1e', // bcrypt for "password123"
    },
  });

  // 2. Set Default User Settings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      theme: 'dark',
      defaultVoice: 'en-US-Standard-C',
      defaultSpeed: 1.0,
      autoScroll: true,
      cloudSync: true,
    },
  });

  // 3. Create Sample Document
  const document = await prisma.document.create({
    data: {
      userId: user.id,
      title: 'EchoReader AI User Guide.txt',
      fileKey: 'uploads/sample-user-guide.txt',
      fileSize: 450,
      fileType: 'txt',
      parsedText: 'Welcome to EchoReader AI. This is a cross-platform Document Reader that parses layout structures and outputs natural voice speech. You can highlight sentences and scroll along. Ask the AI assistant to summarize or answer questions on the document.',
      author: 'EchoReader AI Team',
      language: 'en',
    },
  });

  // 4. Create Document Chunks for RAG
  const textChunks = [
    'Welcome to EchoReader AI.',
    'This is a cross-platform Document Reader that parses layout structures and outputs natural voice speech.',
    'You can highlight sentences and scroll along.',
    'Ask the AI assistant to summarize or answer questions on the document.'
  ];

  for (let i = 0; i < textChunks.length; i++) {
    await prisma.documentChunk.create({
      data: {
        documentId: document.id,
        pageIndex: 0,
        paragraphIndex: 0,
        sentenceIndex: i,
        content: textChunks[i],
        wordCount: textChunks[i].split(/\s+/).length,
      },
    });
  }

  console.log('Seeding Completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
