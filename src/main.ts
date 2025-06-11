import { NestFactory } from '@nestjs/core';
import { AppModule } from './App/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend URLs
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove chaves que não estão no DTO
      forbidNonWhitelisted: true, // Lança erro se chaves não permitidas forem enviadas
      transform: true, // Transforma os dados recebidos em instâncias dos DTOs
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
