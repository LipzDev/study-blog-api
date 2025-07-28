# 📚 Enums e Tipos da API Study Blog

Esta documentação descreve todos os enums e tipos utilizados na API para facilitar a integração.

## 👥 UserRole (Roles de Usuário)

```typescript
enum UserRole {
  USER = 'user', // Usuário comum
  ADMIN = 'admin', // Administrador
  SUPER_ADMIN = 'super_admin', // Super Administrador
}
```

### Descrição dos Roles:

- **USER**: Usuário comum, pode criar posts e comentários
- **ADMIN**: Pode gerenciar usuários e conteúdo
- **SUPER_ADMIN**: Acesso total ao sistema

## 🔐 UserProvider (Provedores de Autenticação)

```typescript
enum UserProvider {
  LOCAL = 'local', // Autenticação local (email/senha)
  GOOGLE = 'google', // Autenticação via Google OAuth
}
```

## 📝 Status de Verificação de Email

```typescript
emailVerified: boolean;
```

- **true**: Email verificado
- **false**: Email não verificado

## 🗓️ Formatos de Data

Todas as datas são retornadas no formato ISO 8601:

```typescript
// Exemplo: 2024-01-15T10:30:00.000Z
createdAt: Date;
updatedAt: Date;
date: Date; // Para posts
```

## 🔍 Parâmetros de Paginação

```typescript
interface PaginationParams {
  page: number; // Número da página (padrão: 1)
  limit: number; // Itens por página (padrão: 12)
  search?: string; // Busca no título e conteúdo
  startDate?: string; // Data inicial (YYYY-MM-DD)
  endDate?: string; // Data final (YYYY-MM-DD)
  authorId?: string; // Filtrar por autor
}
```

## 📊 Resposta de Paginação

```typescript
interface PaginatedResponse<T> {
  posts: T[]; // Array de itens
  total: number; // Total de itens
  page: number; // Página atual
  limit: number; // Itens por página
  totalPages: number; // Total de páginas
}
```

## 🔑 Autenticação JWT

```typescript
// Header necessário para endpoints protegidos
Authorization: Bearer <jwt_token>

// Token obtido através do endpoint POST /auth/login
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { /* dados do usuário */ }
}
```

## 📁 Upload de Arquivos

### Tipos de Arquivo Aceitos:

- **Imagens**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **Tamanho máximo**: 5MB

### Endpoint de Upload:

```
POST /auth/upload-avatar
Content-Type: multipart/form-data
```

## 🚨 Códigos de Erro HTTP

| Código | Descrição                                 |
| ------ | ----------------------------------------- |
| 200    | OK - Sucesso                              |
| 201    | Created - Recurso criado                  |
| 400    | Bad Request - Dados inválidos             |
| 401    | Unauthorized - Token inválido/ausente     |
| 403    | Forbidden - Sem permissão                 |
| 404    | Not Found - Recurso não encontrado        |
| 409    | Conflict - Conflito (ex: email já existe) |
| 500    | Internal Server Error - Erro interno      |

## 📋 Validações de Dados

### Posts:

- **slug**: String único, obrigatório
- **title**: String, obrigatório
- **text**: String, mínimo 50 caracteres
- **image**: String URL, opcional
- **imagePath**: String, opcional

### Comentários:

- **content**: String, 1-1000 caracteres

### Usuários:

- **email**: Email válido, único
- **name**: String, obrigatório
- **password**: String, mínimo 6 caracteres
- **bio**: String, opcional
- **avatar**: String URL, opcional
- **github**: String URL, opcional
- **linkedin**: String URL, opcional
- **twitter**: String URL, opcional
- **instagram**: String URL, opcional

## 🔗 URLs de Redes Sociais

Todas as URLs de redes sociais são opcionais e devem ser URLs válidas:

- **GitHub**: `https://github.com/username`
- **LinkedIn**: `https://linkedin.com/in/username`
- **Twitter**: `https://twitter.com/username`
- **Instagram**: `https://instagram.com/username`

## 📧 Email de Verificação

Após o registro, um email de verificação é enviado automaticamente. O usuário deve:

1. Acessar o link no email
2. Ou usar o endpoint `GET /auth/verify-email?token=<token>`

## 🔄 Redefinição de Senha

1. Solicitar redefinição: `POST /auth/forgot-password`
2. Redefinir senha: `POST /auth/reset-password` com token

## 🎯 Endpoints Principais

### Autenticação:

- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login
- `GET /auth/profile` - Obter perfil (protegido)

### Posts:

- `GET /posts` - Listar todos os posts
- `GET /posts/paginated` - Posts paginados
- `GET /posts/recent` - Posts recentes
- `GET /posts/slug/:slug` - Post por slug
- `POST /posts` - Criar post (protegido)

### Comentários:

- `GET /comments/post/:postId` - Comentários de um post
- `POST /comments/:postId` - Criar comentário (protegido)
- `PATCH /comments/:id` - Editar comentário (protegido)
- `DELETE /comments/:id` - Excluir comentário (protegido)

### Usuários (Admin):

- `GET /users` - Listar usuários (ADMIN/SUPER_ADMIN)
- `PATCH /users/:id` - Atualizar usuário (ADMIN/SUPER_ADMIN)
- `DELETE /users/:id` - Excluir usuário (SUPER_ADMIN)

## 🔒 Permissões por Endpoint

| Endpoint                   | USER | ADMIN | SUPER_ADMIN |
| -------------------------- | ---- | ----- | ----------- |
| Criar post                 | ✅   | ✅    | ✅          |
| Editar próprio post        | ✅   | ✅    | ✅          |
| Editar qualquer post       | ❌   | ✅    | ✅          |
| Excluir próprio post       | ✅   | ✅    | ✅          |
| Excluir qualquer post      | ❌   | ✅    | ✅          |
| Criar comentário           | ✅   | ✅    | ✅          |
| Editar próprio comentário  | ✅   | ✅    | ✅          |
| Excluir próprio comentário | ✅   | ✅    | ✅          |
| Gerenciar usuários         | ❌   | ✅    | ✅          |
| Excluir usuários           | ❌   | ❌    | ✅          |

## 📱 Exemplo de Integração

```javascript
// Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' }),
});

const { access_token, user } = await loginResponse.json();

// Criar post (protegido)
const postResponse = await fetch('/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${access_token}`,
  },
  body: JSON.stringify({
    slug: 'meu-post',
    title: 'Meu Post',
    text: 'Conteúdo do post...',
  }),
});

// Buscar posts paginados
const postsResponse = await fetch('/posts/paginated?page=1&limit=10');
const { posts, total, page, totalPages } = await postsResponse.json();
```
