import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket = process.env.MINIO_BUCKET || 'intercom';

  constructor() {
    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || '',
        secretAccessKey: process.env.MINIO_SECRET_KEY || '',
      },
      forcePathStyle: true,
    });
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname);
    const key = `posts/${randomUUID()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
    return `${endpoint}/${this.bucket}/${key}`;
  }

  async delete(url: string): Promise<void> {
    const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
    const key = url.replace(`${endpoint}/${this.bucket}/`, '');

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
