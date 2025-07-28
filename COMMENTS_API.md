# API de Comentários

Esta documentação descreve os endpoints disponíveis para gerenciar comentários nas postagens.

## Endpoints

### 1. Criar Comentário

**POST** `/comments/:postId`

Cria um novo comentário em uma postagem específica.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**

```json
{
  "content": "Conteúdo do comentário"
}
```

**Resposta:**

```json
{
  "id": "uuid-do-comentario",
  "content": "Conteúdo do comentário",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "author": {
    "id": "uuid-do-usuario",
    "name": "Nome do Usuário",
    "email": "usuario@email.com",
    "avatar": "url-do-avatar",
    "bio": "Biografia do usuário",
    "github": "https://github.com/usuario",
    "linkedin": "https://linkedin.com/in/usuario",
    "twitter": "https://twitter.com/usuario",
    "instagram": "https://instagram.com/usuario"
  }
}
```

### 2. Listar Comentários de uma Postagem

**GET** `/comments/post/:postId`

Retorna todos os comentários de uma postagem específica, ordenados por data de criação (mais antigos primeiro).

**Resposta:**

```json
[
  {
    "id": "uuid-do-comentario-1",
    "content": "Primeiro comentário",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid-do-usuario-1",
      "name": "Nome do Usuário 1",
      "email": "usuario1@email.com",
      "avatar": "url-do-avatar-1",
      "bio": "Biografia do usuário 1",
      "github": "https://github.com/usuario1",
      "linkedin": "https://linkedin.com/in/usuario1",
      "twitter": "https://twitter.com/usuario1",
      "instagram": "https://instagram.com/usuario1"
    }
  },
  {
    "id": "uuid-do-comentario-2",
    "content": "Segundo comentário",
    "createdAt": "2024-01-01T01:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z",
    "author": {
      "id": "uuid-do-usuario-2",
      "name": "Nome do Usuário 2",
      "email": "usuario2@email.com",
      "avatar": "url-do-avatar-2",
      "bio": "Biografia do usuário 2",
      "github": "https://github.com/usuario2",
      "linkedin": "https://linkedin.com/in/usuario2",
      "twitter": "https://twitter.com/usuario2",
      "instagram": "https://instagram.com/usuario2"
    }
  }
]
```

### 3. Buscar Comentário Específico

**GET** `/comments/:id`

Retorna um comentário específico pelo ID.

**Resposta:**

```json
{
  "id": "uuid-do-comentario",
  "content": "Conteúdo do comentário",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "author": {
    "id": "uuid-do-usuario",
    "name": "Nome do Usuário",
    "email": "usuario@email.com",
    "avatar": "url-do-avatar",
    "bio": "Biografia do usuário",
    "github": "https://github.com/usuario",
    "linkedin": "https://linkedin.com/in/usuario",
    "twitter": "https://twitter.com/usuario",
    "instagram": "https://instagram.com/usuario"
  }
}
```

### 4. Atualizar Comentário

**PATCH** `/comments/:id`

Atualiza um comentário existente. Apenas o autor do comentário pode editá-lo.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**

```json
{
  "content": "Novo conteúdo do comentário"
}
```

**Resposta:**

```json
{
  "id": "uuid-do-comentario",
  "content": "Novo conteúdo do comentário",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T02:00:00.000Z",
  "author": {
    "id": "uuid-do-usuario",
    "name": "Nome do Usuário",
    "email": "usuario@email.com",
    "avatar": "url-do-avatar",
    "bio": "Biografia do usuário",
    "github": "https://github.com/usuario",
    "linkedin": "https://linkedin.com/in/usuario",
    "twitter": "https://twitter.com/usuario",
    "instagram": "https://instagram.com/usuario"
  }
}
```

### 5. Excluir Comentário

**DELETE** `/comments/:id`

Exclui um comentário. Apenas o autor do comentário pode excluí-lo.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Resposta:** Status 200 (sem corpo)

## Códigos de Erro

- **400 Bad Request**: Dados inválidos no corpo da requisição
- **401 Unauthorized**: Token JWT inválido ou ausente
- **403 Forbidden**: Usuário não tem permissão para realizar a ação
- **404 Not Found**: Comentário ou postagem não encontrada
- **500 Internal Server Error**: Erro interno do servidor

## Validações

- **content**: String obrigatória com mínimo de 1 caractere e máximo de 1000 caracteres
- **postId**: UUID válido de uma postagem existente
- **authorId**: UUID do usuário autenticado (automático)

## Segurança

- Todos os endpoints de criação, edição e exclusão requerem autenticação JWT
- Usuários só podem editar/excluir seus próprios comentários
- Comentários são automaticamente excluídos quando a postagem é removida (CASCADE)

## Exemplo de Uso no Frontend

```javascript
// Buscar comentários de uma postagem
const getComments = async (postId) => {
  const response = await fetch(`/api/comments/post/${postId}`);
  const comments = await response.json();
  return comments;
};

// Criar um novo comentário
const createComment = async (postId, content, token) => {
  const response = await fetch(`/api/comments/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  return await response.json();
};
```
