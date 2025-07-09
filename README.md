# 📚 Study Blog API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  <strong>Backend de uma plataforma moderna para compartilhar conhecimento e experiências de estudo</strong>
</p>

## 🚀 Sobre o Projeto

Esta é a API backend de uma plataforma de blog educacional desenvolvida com **NestJS**, **TypeScript** e **PostgreSQL**. O sistema oferece uma experiência completa para criar, gerenciar e consumir conteúdo educacional através de endpoints RESTful seguros e escaláveis.

### ✨ Funcionalidades Principais

- 🔐 **Sistema de Autenticação Completo**

  - Login/Registro com JWT
  - Login com Google OAuth
  - Verificação de email
  - Recuperação de senha
  - Upload de avatar

- 👥 **Controle de Acesso Baseado em Papéis (RBAC)**

  - **SUPER_ADMIN**: Acesso total ao sistema
  - **ADMIN**: Gerenciamento de usuários e posts
  - **USER**: Funcionalidades básicas

- 📝 **Gerenciamento de Posts**

  - CRUD completo de posts
  - Upload de imagens
  - Paginação e filtros avançados
  - Controle de permissões por papel

- 📧 **Sistema de Email**

  - Verificação de conta
  - Recuperação de senha
  - Notificações automáticas

- 🗂️ **Upload de Arquivos**
  - Upload de imagens para posts
  - Upload de avatares
  - Validação de tipos e tamanhos

## 🛠️ Tecnologias Utilizadas

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: Passport.js + JWT
- **Upload**: Multer
- **Email**: Nodemailer
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- PostgreSQL
- npm ou yarn

## 🌐 Variáveis de Ambiente Importantes

Adicione as seguintes variáveis ao seu arquivo .env:

```env
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
```

- `FRONTEND_URL`: URL do frontend (Next.js)
- `API_URL`: URL da API (NestJS)

Certifique-se de configurar corretamente essas variáveis para o ambiente de desenvolvimento e produção.

## ⚙️ Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd study-blog-api
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de template e configure suas variáveis:

```bash
cp env-template.txt .env
```

Edite o arquivo `.env` com suas configurações, incluindo FRONTEND_URL e API_URL:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=study_blog

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu_email@gmail.com
MAIL_PASS=sua_senha_de_app
MAIL_FROM=seu_email@gmail.com

# App
PORT=3001
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
```

### 4. Configure o banco de dados

```bash
# Crie o banco de dados
createdb study_blog

# O TypeORM irá criar as tabelas automaticamente em desenvolvimento
# (synchronize: true está habilitado)
```

## 🚀 Como Executar

### Desenvolvimento

```bash
# Modo desenvolvimento com hot reload
npm run start:dev
# ou
yarn start:dev
```

> Certifique-se de que as variáveis FRONTEND_URL e API_URL estejam corretamente configuradas no seu .env antes de iniciar o backend.

### Produção

```bash
# Build do projeto
npm run build

# Executar em produção
npm run start:prod
```

## 🧪 Executando Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 📚 Documentação da API

Após iniciar o servidor, acesse a documentação Swagger:

**URL**: http://localhost:3001/api/docs

A documentação inclui:

- Todos os endpoints disponíveis
- Exemplos de requisições e respostas
- Autenticação JWT
- Testes interativos

## 🔐 Endpoints Principais

### Autenticação

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login com email/senha
- `GET /auth/google` - Login com Google
- `POST /auth/forgot-password` - Solicitar recuperação de senha
- `POST /auth/reset-password` - Redefinir senha

### Posts

- `GET /posts` - Listar posts (com paginação)
- `POST /posts` - Criar novo post
- `GET /posts/:id` - Obter post específico
- `PUT /posts/:id` - Atualizar post
- `DELETE /posts/:id` - Deletar post

### Usuários

- `GET /users` - Listar usuários (ADMIN/SUPER_ADMIN)
- `GET /users/:id` - Obter usuário específico
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

### Uploads

- `POST /uploads/image` - Upload de imagem para posts
- `POST /auth/upload-avatar` - Upload de avatar

## 👥 Sistema de Papéis

### SUPER_ADMIN

- Acesso total ao sistema
- Pode promover/rebaixar administradores
- Pode deletar qualquer post
- Gerenciamento completo de usuários

### ADMIN

- Pode listar e buscar usuários
- Pode deletar qualquer post
- **NÃO** pode promover/rebaixar admins

### USER

- Pode criar, editar e deletar seus próprios posts
- Acesso às funcionalidades básicas
- Pode atualizar seu próprio perfil

## 🔧 Estrutura do Projeto

```
src/
├── App/                 # Módulo principal
├── auth/               # Autenticação e autorização
│   ├── guards/         # Guards de autenticação
│   ├── strategies/     # Estratégias do Passport
│   └── dto/           # DTOs de autenticação
├── posts/             # Gerenciamento de posts
├── users/             # Gerenciamento de usuários
├── mail/              # Sistema de email
├── uploads/           # Upload de arquivos
└── types/             # Tipos TypeScript
```

## 🚀 Deploy

### Variáveis de Ambiente para Produção

Certifique-se de configurar:

- `NODE_ENV=production`
- `synchronize=false` (desabilite sincronização automática)
- Configure um JWT_SECRET forte
- Configure credenciais de email válidas

### Docker (Opcional)

```bash
# Build da imagem
docker build -t study-blog-api .

# Executar container
docker run -p 3001:3001 study-blog-api
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando NestJS**
