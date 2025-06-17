import { NestFactory } from '@nestjs/core';
import { AppModule } from './App/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend URLs
    credentials: true,
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove chaves que não estão no DTO
      forbidNonWhitelisted: true, // Lança erro se chaves não permitidas forem enviadas
      transform: true, // Transforma os dados recebidos em instâncias dos DTOs
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('API for blog application with authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log('🚀 Server running on http://localhost:3001');
  console.log('📚 Swagger docs available at http://localhost:3001/api/docs');
}
bootstrap();
