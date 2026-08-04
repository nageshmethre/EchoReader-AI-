import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface StorageProvider {
  uploadFile(fileKey: string, buffer: Buffer, mimeType: string): Promise<string>;
  downloadFile(fileKey: string): Promise<Buffer>;
  deleteFile(fileKey: string): Promise<void>;
}

// Local Disk Storage Implementation
export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(baseDir = 'uploads') {
    this.baseDir = path.resolve(baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(fileKey: string, buffer: Buffer): Promise<string> {
    const fullPath = path.join(this.baseDir, fileKey);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(fullPath, buffer);
    return `file://${fullPath}`;
  }

  async downloadFile(fileKey: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, fileKey);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fileKey}`);
    }
    return fs.promises.readFile(fullPath);
  }

  async deleteFile(fileKey: string): Promise<void> {
    const fullPath = path.join(this.baseDir, fileKey);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}

// AWS S3 Cloud Storage Implementation
export class S3StorageProvider implements StorageProvider {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.AWS_BUCKET_NAME || 'echoreader-assets';
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(fileKey: string, buffer: Buffer, mimeType: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        Body: buffer,
        ContentType: mimeType,
      })
    );
    return `https://${this.bucket}.s3.amazonaws.com/${fileKey}`;
  }

  async downloadFile(fileKey: string): Promise<Buffer> {
    const response = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      })
    );
    if (!response.Body) {
      throw new Error('S3 returned empty body');
    }
    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  async deleteFile(fileKey: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      })
    );
  }
}

// Factory to resolve based on configuration settings
export function getStorageProvider(): StorageProvider {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}
