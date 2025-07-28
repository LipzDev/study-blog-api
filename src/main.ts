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
    'https://studycommunity.vercel.app/',
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
    .setDescription(
      `
      ## API do Study Blog      
      
    `,
    )
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT obtido através do login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3001', 'Servidor Local')
    .addServer('https://api.studyblog.com', 'Servidor de Produção')
    .addTag('Auth', 'Autenticação e autorização de usuários')
    .addTag('Posts', 'Gerenciamento de posts do blog')
    .addTag('Comments', 'Sistema de comentários nos posts')
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
      .swagger-ui .info .title { color: #2c3e50; font-size: 2.5em; font-weight: bold; }
      .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; color: #555; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
      .swagger-ui .auth-wrapper { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #d4edda; }
      .swagger-ui .opblock { border-radius: 8px; margin-bottom: 15px; }
      .swagger-ui .opblock.opblock-get { border-color: #61affe; background: rgba(97, 175, 254, 0.1); }
      .swagger-ui .opblock.opblock-post { border-color: #49cc90; background: rgba(73, 204, 144, 0.1); }
      .swagger-ui .opblock.opblock-patch { border-color: #fca130; background: rgba(252, 161, 48, 0.1); }
      .swagger-ui .opblock.opblock-delete { border-color: #f93e3e; background: rgba(249, 62, 62, 0.1); }
      .swagger-ui .opblock-summary { padding: 15px; }
      .swagger-ui .opblock-summary-description { font-weight: 500; }
      .swagger-ui .response-col_status { font-weight: bold; }
      .swagger-ui .response-col_description { font-size: 0.9em; }
      .swagger-ui .model { background: #f8f9fa; border-radius: 5px; padding: 10px; }
      .swagger-ui .model-title { color: #2c3e50; font-weight: bold; }
      .swagger-ui .parameter__name { font-weight: bold; color: #2c3e50; }
      .swagger-ui .parameter__type { color: #6c757d; font-size: 0.9em; }
      .swagger-ui .parameter__required { color: #dc3545; font-weight: bold; }
      .swagger-ui .btn.execute { background: #007bff; border-color: #007bff; }
      .swagger-ui .btn.execute:hover { background: #0056b3; border-color: #0056b3; }
      .swagger-ui .btn.authorize { background: #28a745; border-color: #28a745; }
      .swagger-ui .btn.authorize:hover { background: #1e7e34; border-color: #1e7e34; }
      .swagger-ui .tag { background: #6c757d; color: white; border-radius: 15px; padding: 5px 12px; }
      .swagger-ui .tag-description { color: #6c757d; font-style: italic; }
    `,
    customSiteTitle: 'Study Blog API',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Servidor rodando na porta ${port}`);
}

void bootstrap();
