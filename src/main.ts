import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, '');
}

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .map(normalizeOrigin);

  const defaults = [
    'https://intercom2026.fag.edu.br',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  return Array.from(new Set([...fromEnv, ...defaults]));
}

function validateRequiredEnvironment(): void {
  const required = ['JWT_SECRET', 'DB_PASSWORD', 'MINIO_SECRET_KEY'];
  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`,
    );
  }
}

async function bootstrap() {
  validateRequiredEnvironment();
  const allowedOrigins = getAllowedOrigins();

  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const isAllowed = allowedOrigins.includes(normalizedOrigin);

      callback(isAllowed ? null : new Error('Origem não permitida por CORS'), isAllowed);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
