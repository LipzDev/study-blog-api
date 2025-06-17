const { Client } = require('pg');
require('dotenv').config();

async function checkUsers() {
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

    // Verificar usuários existentes
    const users = await client.query(`
      SELECT id, email, name, role, "createdAt" 
      FROM users 
      ORDER BY "createdAt" ASC
    `);

    console.log(`📊 Total de usuários: ${users.rows.length}`);
    
    if (users.rows.length > 0) {
      console.log('\n👥 Usuários encontrados:');
      users.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });

      // Verificar se já existe um admin
      const adminUsers = users.rows.filter(user => user.role === 'admin');
      
      if (adminUsers.length > 0) {
        console.log(`\n✅ ${adminUsers.length} admin(s) já existe(m):`);
        adminUsers.forEach(admin => {
          console.log(`   - ${admin.name} (${admin.email})`);
        });
      } else {
        console.log('\n⚠️ Nenhum admin encontrado. Definindo o primeiro usuário como admin...');
        
        const firstUser = users.rows[0];
        await client.query(`
          UPDATE users 
          SET role = 'admin' 
          WHERE id = $1
        `, [firstUser.id]);
        
        console.log(`✅ ${firstUser.name} (${firstUser.email}) agora é admin!`);
      }
    } else {
      console.log('\n📝 Nenhum usuário encontrado. Crie uma conta primeiro.');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkUsers();
