import { BadRequestException, Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { getSignedUrl as s3GetSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly signingS3: S3Client;
  private readonly bucket = process.env.MINIO_BUCKET || 'intercom';
  private readonly internalEndpoint =
    process.env.MINIO_ENDPOINT || 'http://localhost:9000';
  private readonly publicEndpoint =
    process.env.MINIO_PUBLIC_ENDPOINT || this.internalEndpoint;
  private readonly normalizedPublicEndpoint = this.trimTrailingSlash(
    this.publicEndpoint,
  );

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

    this.signingS3 = new S3Client({
      region: 'us-east-1',
      endpoint: this.publicEndpoint,
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
      }),
    );

    return key;
  }

  async delete(value: string): Promise<void> {
    const key = this.extractKey(value);

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getPublicUrl(key: string): string {
    const objectKey = this.extractKey(key);
    return `${this.normalizedPublicEndpoint}/${this.bucket}/${objectKey}`;
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const objectKey = this.extractKey(key);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    });

    return s3GetSignedUrl(this.signingS3, command, { expiresIn });
  }

  private extractKey(value: string): string {
    const normalized = value.trim();

    const publicPrefix = `${this.normalizedPublicEndpoint}/${this.bucket}/`;
    if (normalized.startsWith(publicPrefix)) {
      return normalized.slice(publicPrefix.length);
    }

    const internalPrefix = `${this.trimTrailingSlash(this.internalEndpoint)}/${this.bucket}/`;
    if (normalized.startsWith(internalPrefix)) {
      return normalized.slice(internalPrefix.length);
    }

    if (normalized.startsWith('/')) {
      const withoutLeadingSlash = normalized.slice(1);
      if (withoutLeadingSlash.startsWith(`${this.bucket}/`)) {
        return withoutLeadingSlash.slice(this.bucket.length + 1);
      }

      return withoutLeadingSlash;
    }

    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      try {
        const parsed = new URL(normalized);
        const path = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');

        if (path.startsWith(`${this.bucket}/`)) {
          return path.slice(this.bucket.length + 1);
        }

        return path;
      } catch {
        return normalized;
      }
    }

    return normalized;
  }

  private trimTrailingSlash(url: string): string {
    return url.replace(/\/+$/, '');
  }
}
