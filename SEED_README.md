# 🌱 Seed de Usuários - Study Blog API

Este arquivo contém instruções para executar o seed de usuários mock no banco de dados para testar a funcionalidade de busca e paginação.

## 📋 Pré-requisitos

1. Certifique-se de que o banco de dados PostgreSQL está rodando
2. Verifique se as variáveis de ambiente estão configuradas corretamente no arquivo `.env`
3. Certifique-se de que as migrações foram executadas

## 🚀 Como executar o seed

### Opção 1: Usando npm/yarn script (Recomendado)

```bash
# Navegue para a pasta da API
cd study-blog-api

# Execute o seed
npm run seed:users
# ou
yarn seed:users
```

### Opção 2: Executando diretamente com ts-node

```bash
# Navegue para a pasta da API
cd study-blog-api

# Execute o arquivo diretamente
npx ts-node -r tsconfig-paths/register src/users/seed-users.ts
```

## 📊 O que o seed cria

O script irá criar **78 usuários mock** com os seguintes dados:

### 👥 Usuários por nome (para testar busca):

- **10 usuários "Filipe"**: Filipe Gomes, FILIPE GOMES TEIXEIRA, Filipe Silva, etc.
- **10 usuários "João"**: João Silva, João Santos, João Costa, etc.
- **10 usuários "Maria"**: Maria Silva, Maria Santos, Maria Costa, etc.
- **10 usuários "Pedro"**: Pedro Silva, Pedro Santos, Pedro Costa, etc.
- **10 usuários "Ana"**: Ana Silva, Ana Santos, Ana Costa, etc.
- **10 usuários "Carlos"**: Carlos Silva, Carlos Santos, Carlos Costa, etc.
- **3 usuários "Admin"**: Admin Silva, Admin Santos, Admin Costa (com role ADMIN)
- **15 usuários únicos**: Roberto Alves, Fernanda Lima, Ricardo Souza, etc.

### 🔐 Credenciais de acesso:

- **Email**: `[nome].[sobrenome]@test.com`
- **Senha**: `123456` (para todos os usuários)
- **Email verificado**: `true` (para facilitar os testes)
- **Provider**: `local`

## 🧪 Como testar a paginação

### 1. Teste de busca por nome:

1. Acesse a página de gerenciamento de usuários
2. No campo "Buscar Usuário", digite:
   - `Filipe` - deve retornar 10 usuários
   - `João` - deve retornar 10 usuários
   - `Maria` - deve retornar 10 usuários
   - `Silva` - deve retornar múltiplos usuários com sobrenome Silva

### 2. Teste de paginação:

1. Faça uma busca que retorne mais de 10 resultados
2. Use os botões "Anterior" e "Próxima" para navegar
3. Verifique se a contagem de resultados está correta
4. Teste diferentes tamanhos de página (se implementado)

### 3. Teste de busca case-insensitive:

1. Digite `filipe` (minúsculo) - deve encontrar "Filipe Gomes"
2. Digite `FILIPE` (maiúsculo) - deve encontrar "Filipe Gomes"
3. Digite `joao` (minúsculo) - deve encontrar "João Silva"

## 🔄 Re-executar o seed

O script é inteligente e não duplica usuários. Se você executar novamente:

- Usuários que já existem serão **pulados**
- Apenas usuários novos serão **criados**
- Você verá um resumo no final mostrando quantos foram criados/pulados

## 🗑️ Limpar dados de teste (Opcional)

Se quiser limpar os dados de teste, você pode:

1. Deletar manualmente os usuários pelo painel admin
2. Ou executar uma query SQL para deletar usuários com email `@test.com`:

```sql
DELETE FROM users WHERE email LIKE '%@test.com%';
```

## 📝 Logs do seed

O script mostra logs detalhados:

```
🌱 Iniciando seed de usuários...
✅ Usuário criado: Filipe Gomes (filipe.gomes@test.com)
✅ Usuário criado: FILIPE GOMES TEIXEIRA (filipe.teixeira@test.com)
⏭️  Usuário filipe.gomes@test.com já existe, pulando...

📊 Resumo do seed:
✅ Usuários criados: 75
⏭️  Usuários pulados (já existiam): 3
📝 Total processado: 78
🎉 Seed concluído!
```

## 🐛 Solução de problemas

### Erro de conexão com banco:

- Verifique se o PostgreSQL está rodando
- Confirme as variáveis de ambiente no `.env`

### Erro de dependências:

- Execute `npm install` ou `yarn install`
- Verifique se o `ts-node` está instalado

### Erro de permissões:

- Certifique-se de que o usuário do banco tem permissões de escrita

---

**Nota**: Este seed é apenas para desenvolvimento e testes. Não execute em produção!
