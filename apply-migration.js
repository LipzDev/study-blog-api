const { Client } = require('pg');
require('dotenv').config();

async function applyMigration() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao banco de dados');

    // Verificar se a coluna role já existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Coluna role já existe na tabela users');
      return;
    }

    console.log('📝 Aplicando migration: AddUserRole');

    // Criar o tipo enum se não existir
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "user_role_enum" AS ENUM('user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Enum user_role_enum criado/verificado');

    // Adicionar a coluna role com valor padrão 'user'
    await client.query(`
      ALTER TABLE "users" 
      ADD COLUMN "role" "user_role_enum" NOT NULL DEFAULT 'user'
    `);
    console.log('✅ Coluna role adicionada à tabela users');

    // Definir o primeiro usuário como admin (se existir)
    const updateResult = await client.query(`
      UPDATE "users" 
      SET "role" = 'admin' 
      WHERE "id" = (
        SELECT "id" FROM "users" 
        ORDER BY "createdAt" ASC 
        LIMIT 1
      )
    `);

    if (updateResult.rowCount > 0) {
      console.log('✅ Primeiro usuário definido como admin');
    } else {
      console.log('ℹ️ Nenhum usuário encontrado para definir como admin');
    }

    console.log('🎉 Migration aplicada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Conexão com banco encerrada');
  }
}

applyMigration();
