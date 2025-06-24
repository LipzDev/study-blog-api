const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createSeedUsers() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'study_blog',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados');

    // Hash da senha padrão
    const hashedPassword = await bcrypt.hash('123456', 12);

    // Usuários de teste
    const seedUsers = [
      {
        name: 'Super Admin',
        email: 'superadmin@test.com',
        password: hashedPassword,
        role: 'super_admin',
        emailVerified: true,
        provider: 'local',
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
        provider: 'local',
      },
      {
        name: 'Regular User',
        email: 'user@test.com',
        password: hashedPassword,
        role: 'user',
        emailVerified: true,
        provider: 'local',
      },
      {
        name: 'Test User 1',
        email: 'test1@test.com',
        password: hashedPassword,
        role: 'user',
        emailVerified: true,
        provider: 'local',
      },
      {
        name: 'Test User 2',
        email: 'test2@test.com',
        password: hashedPassword,
        role: 'user',
        emailVerified: true,
        provider: 'local',
      },
    ];

    for (const userData of seedUsers) {
      // Verificar se o usuário já existe
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUser.rows.length === 0) {
        // Inserir novo usuário
        const result = await client.query(
          `INSERT INTO users (name, email, password, role, "emailVerified", provider, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           RETURNING id, name, email, role`,
          [
            userData.name,
            userData.email,
            userData.password,
            userData.role,
            userData.emailVerified,
            userData.provider,
          ]
        );

        console.log(`✅ Usuário criado: ${result.rows[0].name} (${result.rows[0].email}) - Role: ${result.rows[0].role}`);
      } else {
        console.log(`⚠️  Usuário já existe: ${userData.email}`);
      }
    }

    console.log('\n🎉 Seed de usuários concluído!');
    console.log('\n📋 Credenciais de teste:');
    console.log('Super Admin: superadmin@test.com / 123456');
    console.log('Admin: admin@test.com / 123456');
    console.log('User: user@test.com / 123456');
    console.log('Test 1: test1@test.com / 123456');
    console.log('Test 2: test2@test.com / 123456');

  } catch (error) {
    console.error('❌ Erro ao criar usuários de seed:', error);
  } finally {
    await client.end();
  }
}

createSeedUsers(); 