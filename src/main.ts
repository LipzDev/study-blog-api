import { NestFactory } from '@nestjs/core';
import { AppModule } from './App/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://study-blog-web.onrender.com',
  ].filter(Boolean) as string[];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'temp'), {
    prefix: '/temp/',
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
    .setTitle('Study Blog API')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .addServer('Servidor de Produção')
    .addTag('Auth', 'Endpoints de autenticação e autorização')
    .addTag('Posts', 'Gerenciamento de posts do blog')
    .addTag('Users', 'Gerenciamento de usuários (ADMIN/SUPER_ADMIN)')
    .addTag('Uploads', 'Upload de imagens para posts')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Customização do Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activated: true,
        theme: 'monokai',
      },
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; font-size: 2.5em; }
      .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
      .swagger-ui .auth-wrapper { background: #e8f5e8; padding: 10px; border-radius: 5px; margin: 10px 0; }
    `,
    customSiteTitle: 'Study Blog API',
  });
}
void bootstrap();
