import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

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

  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? [],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
