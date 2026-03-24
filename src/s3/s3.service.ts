import { BadRequestException, Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { fileTypeFromBuffer } from 'file-type';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket = process.env.MINIO_BUCKET || 'intercom';
  private readonly internalEndpoint =
    process.env.MINIO_ENDPOINT || 'http://localhost:9000';
  private readonly publicEndpoint =
    process.env.MINIO_PUBLIC_ENDPOINT || this.internalEndpoint;

  constructor() {
    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: this.internalEndpoint,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || '',
        secretAccessKey: process.env.MINIO_SECRET_KEY || '',
      },
      forcePathStyle: true,
    });
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const detected = await fileTypeFromBuffer(file.buffer);
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    if (!detected || !allowed.includes(detected.mime)) {
      throw new BadRequestException('Tipo de arquivo inválido');
    }

    const ext = path.extname(file.originalname);
    const key = `posts/${randomUUID()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: detected.mime,
        ACL: 'public-read', // Torna o objeto público
      }),
    );

    return `${this.publicEndpoint}/${this.bucket}/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = url.replace(`${this.publicEndpoint}/${this.bucket}/`, '');

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
