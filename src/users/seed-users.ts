import { NestFactory } from '@nestjs/core';
import { AppModule } from '../App/app.module';
import { UsersService } from './users.service';
import { UserProvider, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function seedUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  console.log('🌱 Iniciando seed de usuários...');

  const mockUsers = [
    // Usuários com nomes similares para testar busca
    {
      name: 'Filipe Gomes',
      email: 'filipe.gomes@test.com',
      role: UserRole.USER,
    },
    {
      name: 'FILIPE GOMES TEIXEIRA',
      email: 'filipe.teixeira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Filipe Silva',
      email: 'filipe.silva@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Filipe Santos',
      email: 'filipe.santos@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Filipe Costa',
      email: 'filipe.costa@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Filipe Oliveira',
      email: 'filipe.oliveira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Filipe Pereira',
      email: 'filipe.pereira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Filipe Rodrigues',
      email: 'filipe.rodrigues@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Filipe Almeida',
      email: 'filipe.almeida@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Filipe Ferreira',
      email: 'filipe.ferreira@test.com',
      role: UserRole.USER,
    },

    // Usuários com "João" para testar busca
    { name: 'João Silva', email: 'joao.silva@test.com', role: UserRole.USER },
    { name: 'João Santos', email: 'joao.santos@test.com', role: UserRole.USER },
    { name: 'João Costa', email: 'joao.costa@test.com', role: UserRole.USER },
    {
      name: 'João Oliveira',
      email: 'joao.oliveira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'João Pereira',
      email: 'joao.pereira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'João Rodrigues',
      email: 'joao.rodrigues@test.com',
      role: UserRole.USER,
    },
    {
      name: 'João Almeida',
      email: 'joao.almeida@test.com',
      role: UserRole.USER,
    },
    {
      name: 'João Ferreira',
      email: 'joao.ferreira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'João Martins',
      email: 'joao.martins@test.com',
      role: UserRole.USER,
    },
    { name: 'João Lima', email: 'joao.lima@test.com', role: UserRole.USER },

    // Usuários com "Maria" para testar busca
    { name: 'Maria Silva', email: 'maria.silva@test.com', role: UserRole.USER },
    {
      name: 'Maria Santos',
      email: 'maria.santos@test.com',
      role: UserRole.USER,
    },
    { name: 'Maria Costa', email: 'maria.costa@test.com', role: UserRole.USER },
    {
      name: 'Maria Oliveira',
      email: 'maria.oliveira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Maria Pereira',
      email: 'maria.pereira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Maria Rodrigues',
      email: 'maria.rodrigues@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Maria Almeida',
      email: 'maria.almeida@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Maria Ferreira',
      email: 'maria.ferreira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Maria Martins',
      email: 'maria.martins@test.com',
      role: UserRole.USER,
    },
    { name: 'Maria Lima', email: 'maria.lima@test.com', role: UserRole.USER },

    // Usuários com "Pedro" para testar busca
    { name: 'Pedro Silva', email: 'pedro.silva@test.com', role: UserRole.USER },
    {
      name: 'Pedro Santos',
      email: 'pedro.santos@test.com',
      role: UserRole.USER,
    },
    { name: 'Pedro Costa', email: 'pedro.costa@test.com', role: UserRole.USER },
    {
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Pedro Pereira',
      email: 'pedro.pereira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Pedro Rodrigues',
      email: 'pedro.rodrigues@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Pedro Almeida',
      email: 'pedro.almeida@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Pedro Ferreira',
      email: 'pedro.ferreira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Pedro Martins',
      email: 'pedro.martins@test.com',
      role: UserRole.USER,
    },
    { name: 'Pedro Lima', email: 'pedro.lima@test.com', role: UserRole.USER },

    // Usuários com "Ana" para testar busca
    { name: 'Ana Silva', email: 'ana.silva@test.com', role: UserRole.USER },
    { name: 'Ana Santos', email: 'ana.santos@test.com', role: UserRole.USER },
    { name: 'Ana Costa', email: 'ana.costa@test.com', role: UserRole.USER },
    {
      name: 'Ana Oliveira',
      email: 'ana.oliveira@test.com',
      role: UserRole.USER,
    },
    { name: 'Ana Pereira', email: 'ana.pereira@test.com', role: UserRole.USER },
    {
      name: 'Ana Rodrigues',
      email: 'ana.rodrigues@test.com',
      role: UserRole.USER,
    },
    { name: 'Ana Almeida', email: 'ana.almeida@test.com', role: UserRole.USER },
    {
      name: 'Ana Ferreira',
      email: 'ana.ferreira@test.com',
      role: UserRole.USER,
    },
    { name: 'Ana Martins', email: 'ana.martins@test.com', role: UserRole.USER },
    { name: 'Ana Lima', email: 'ana.lima@test.com', role: UserRole.USER },

    // Usuários com "Carlos" para testar busca
    {
      name: 'Carlos Silva',
      email: 'carlos.silva@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Carlos Santos',
      email: 'carlos.santos@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Carlos Costa',
      email: 'carlos.costa@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Carlos Pereira',
      email: 'carlos.pereira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Carlos Rodrigues',
      email: 'carlos.rodrigues@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Carlos Almeida',
      email: 'carlos.almeida@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Carlos Ferreira',
      email: 'carlos.ferreira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Carlos Martins',
      email: 'carlos.martins@test.com',
      role: UserRole.USER,
    },
    { name: 'Carlos Lima', email: 'carlos.lima@test.com', role: UserRole.USER },

    // Alguns admins para testar diferentes roles
    {
      name: 'Admin Silva',
      email: 'admin.silva@test.com',
      role: UserRole.ADMIN,
    },
    {
      name: 'Admin Santos',
      email: 'admin.santos@test.com',
      role: UserRole.ADMIN,
    },
    {
      name: 'Admin Costa',
      email: 'admin.costa@test.com',
      role: UserRole.ADMIN,
    },

    // Usuários com nomes únicos para testar busca específica
    {
      name: 'Roberto Alves',
      email: 'roberto.alves@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Fernanda Lima',
      email: 'fernanda.lima@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Ricardo Souza',
      email: 'ricardo.souza@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Patrícia Rocha',
      email: 'patricia.rocha@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Marcelo Barbosa',
      email: 'marcelo.barbosa@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Juliana Cardoso',
      email: 'juliana.cardoso@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Thiago Mendes',
      email: 'thiago.mendes@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Camila Nascimento',
      email: 'camila.nascimento@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Diego Moreira',
      email: 'diego.moreira@test.com',
      role: UserRole.USER,
    },
    {
      name: 'Vanessa Carvalho',
      email: 'vanessa.carvalho@test.com',
      role: UserRole.USER,
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const userData of mockUsers) {
    try {
      // Verificar se o usuário já existe
      const existingUser = await usersService.findByEmail(userData.email);

      if (existingUser) {
        console.log(`⏭️  Usuário ${userData.email} já existe, pulando...`);
        skippedCount++;
        continue;
      }

      // Criar hash da senha
      const hashedPassword = await bcrypt.hash('123456', 10);

      // Criar usuário
      await usersService.create({
        ...userData,
        password: hashedPassword,
        provider: UserProvider.LOCAL,
        emailVerified: true, // Para facilitar os testes
      });

      console.log(`✅ Usuário criado: ${userData.name} (${userData.email})`);
      createdCount++;
    } catch (error) {
      console.error(
        `❌ Erro ao criar usuário ${userData.email}:`,
        error.message,
      );
    }
  }

  console.log('\n📊 Resumo do seed:');
  console.log(`✅ Usuários criados: ${createdCount}`);
  console.log(`⏭️  Usuários pulados (já existiam): ${skippedCount}`);
  console.log(`📝 Total processado: ${mockUsers.length}`);

  await app.close();
  console.log('🎉 Seed concluído!');
}

// Executar o seed se o arquivo for executado diretamente
if (require.main === module) {
  seedUsers().catch(console.error);
}

export { seedUsers };
