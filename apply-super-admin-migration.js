const { Client } = require('pg');
require('dotenv').config();

async function applySuperAdminMigration() {
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

    // Verificar se a coluna is_super_admin já existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_super_admin'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Coluna is_super_admin já existe na tabela users');
    } else {
      console.log('📝 Aplicando migration: AddSuperAdminField');

      // Adicionar coluna is_super_admin
      await client.query(`
        ALTER TABLE "users" 
        ADD COLUMN "is_super_admin" boolean NOT NULL DEFAULT false
      `);
      console.log('✅ Coluna is_super_admin adicionada à tabela users');
    }

    // Verificar se já existe um super admin
    const existingSuperAdmin = await client.query(`
      SELECT id, email, name 
      FROM users 
      WHERE is_super_admin = true
    `);

    if (existingSuperAdmin.rows.length > 0) {
      console.log('✅ Super admin já existe:');
      existingSuperAdmin.rows.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email})`);
      });
    } else {
      console.log('⚠️ Nenhum super admin encontrado. Definindo o primeiro usuário como super admin...');
      
      // Definir o primeiro usuário (mais antigo) como super admin
      const updateResult = await client.query(`
        UPDATE "users" 
        SET "is_super_admin" = true, "role" = 'admin'
        WHERE "id" = (
          SELECT "id" FROM "users" 
          ORDER BY "createdAt" ASC 
          LIMIT 1
        )
        RETURNING id, email, name
      `);
      
      if (updateResult.rows.length > 0) {
        const superAdmin = updateResult.rows[0];
        console.log(`✅ ${superAdmin.name} (${superAdmin.email}) agora é SUPER ADMIN!`);
        console.log('🚨 IMPORTANTE: Este é o único super admin do sistema!');
      } else {
        console.log('ℹ️ Nenhum usuário encontrado para definir como super admin');
      }
    }

    // Mostrar estatísticas finais
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN is_super_admin = true THEN 1 END) as total_super_admins
      FROM users
    `);

    const { total_users, total_admins, total_super_admins } = stats.rows[0];
    console.log('\n📊 Estatísticas do sistema:');
    console.log(`   - Total de usuários: ${total_users}`);
    console.log(`   - Total de admins: ${total_admins}`);
    console.log(`   - Total de super admins: ${total_super_admins}`);

    console.log('\n🎉 Migration aplicada com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão com banco encerrada');
  }
}

applySuperAdminMigration();
