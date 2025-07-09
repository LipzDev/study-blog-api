import { NestFactory } from '@nestjs/core';
import { AppModule } from './App/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  const allowedOrigins = [process.env.FRONTEND_URL, process.env.API_URL].filter(
    Boolean,
  ) as string[];
  app.enableCors({
    origin: allowedOrigins, // Frontend URLs
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
    .setTitle(
      'Blog API - Sistema de Controle de Acesso Baseado em Papéis (RBAC)',
    )
    .setDescription(
      `
      ## 📚 API para Blog com Sistema RBAC Completo

      ### 🧠 **Sistema de Papéis (Roles)**
      - **SUPER_ADMIN**: Acesso total ao sistema
      - **ADMIN**: Gerenciamento de usuários e posts
      - **USER**: Funcionalidades básicas

      ### 🔐 **Permissões por Papel**

      #### SUPER_ADMIN pode:
      - Promover/rebaixar administradores
      - Deletar qualquer post
      - Acessar todas as funcionalidades
      - Gerenciar usuários

      #### ADMIN pode:
      - Listar e buscar usuários
      - Deletar qualquer post
      - Não pode promover/rebaixar admins

      #### USER pode:
      - Criar, editar e deletar seus próprios posts
      - Acessar funcionalidades básicas

      ### 🚀 **Funcionalidades Principais**
      - **Autenticação JWT** com roles no payload
      - **Controle de acesso granular** via decorators @Roles()
      - **Upload de imagens** para posts
      - **Verificação de email** para usuários locais
      - **Login com Google OAuth**
      - **Recuperação de senha** via email
      - **Paginação e filtros** avançados para posts
      - **Logs automáticos** de ações sensíveis

      ### 📋 **Endpoints Protegidos**
      - Rotas de posts requerem autenticação
      - Rotas de usuários requerem ADMIN ou SUPER_ADMIN
      - Rotas de promoção/rebaixamento requerem SUPER_ADMIN

      ### 🔑 **Autenticação**
      Use o Bearer Token JWT retornado no login para acessar endpoints protegidos.
    `,
    )
    .setVersion('2.0.0')
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
    .addServer(process.env.API_URL || '', 'Servidor de Desenvolvimento')
    .addServer(process.env.FRONTEND_URL || '', 'Servidor Alternativo')
    .addTag('Authentication', 'Endpoints de autenticação e autorização')
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
    customSiteTitle: 'Blog API - RBAC Documentation',
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log('🚀 Server running on http://localhost:3001');
  console.log('📚 Swagger docs available at http://localhost:3001/api/docs');
}
void bootstrap();
