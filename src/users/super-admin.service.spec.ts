import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserProvider, UserRole } from './entities/user.entity';

describe('UsersService - Super Admin Management', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should prevent creating SUPER_ADMIN through create method', async () => {
      // Simular que não existe usuário com este email
      mockUserRepository.findOne.mockResolvedValueOnce(null); // findByEmail

      const userData = {
        email: 'new@example.com',
        name: 'New User',
        role: UserRole.SUPER_ADMIN,
      };

      await expect(service.create(userData)).rejects.toThrow(
        'Não é possível criar um Super Administrador através deste método. Use o método específico para promover um usuário a SUPER_ADMIN.',
      );
    });

    it('should set default role as USER when not specified', async () => {
      // Simular que não existe usuário com este email
      mockUserRepository.findOne.mockResolvedValueOnce(null); // findByEmail

      const userData = {
        email: 'new@example.com',
        name: 'New User',
        // role não especificado
      };

      const mockUser = {
        id: '1',
        ...userData,
        role: UserRole.USER,
        provider: UserProvider.LOCAL,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(userData);
      expect(result.role).toBe(UserRole.USER);
    });
  });

  describe('getSuperAdmin', () => {
    it('should get super admin', async () => {
      const mockSuperAdmin = {
        id: '1',
        name: 'Super Admin',
        email: 'super@example.com',
        role: UserRole.SUPER_ADMIN,
        createdAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockSuperAdmin);

      const result = await service.getSuperAdmin();
      expect(result).toEqual(mockSuperAdmin);
    });
  });

  describe('hasSuperAdmin', () => {
    it('should check if super admin exists', async () => {
      mockUserRepository.count.mockResolvedValue(1);

      const result = await service.hasSuperAdmin();
      expect(result).toBe(true);
    });

    it('should check if super admin does not exist', async () => {
      mockUserRepository.count.mockResolvedValue(0);

      const result = await service.hasSuperAdmin();
      expect(result).toBe(false);
    });
  });

  describe('promoteToSuperAdmin', () => {
    it('should promote user to super admin', async () => {
      const requester = {
        id: '1',
        email: 'requester@example.com',
        role: UserRole.SUPER_ADMIN,
        name: 'Requester',
        provider: UserProvider.LOCAL,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        posts: [],
      };

      const targetUser = {
        id: '2',
        name: 'Target User',
        email: 'target@example.com',
        role: UserRole.ADMIN,
        provider: UserProvider.LOCAL,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        posts: [],
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(targetUser) // find user by id
        .mockResolvedValueOnce(null) // no existing super admin
        .mockResolvedValueOnce({ ...targetUser, role: UserRole.SUPER_ADMIN }); // updated user

      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.promoteToSuperAdmin('2', requester);

      expect(result.message).toContain('Super Administrador');
      expect(result.user.role).toBe(UserRole.SUPER_ADMIN);
    });

    it('should prevent promoting when super admin already exists', async () => {
      const requester = {
        id: '1',
        email: 'requester@example.com',
        role: UserRole.SUPER_ADMIN,
        name: 'Requester',
        provider: UserProvider.LOCAL,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        posts: [],
      };

      const targetUser = {
        id: '2',
        name: 'Target User',
        email: 'target@example.com',
        role: UserRole.ADMIN,
        provider: UserProvider.LOCAL,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        posts: [],
      };

      const existingSuperAdmin = {
        id: '3',
        name: 'Existing Super Admin',
        email: 'existing@example.com',
        role: UserRole.SUPER_ADMIN,
        provider: UserProvider.LOCAL,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        posts: [],
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(targetUser) // find user by id
        .mockResolvedValueOnce(existingSuperAdmin); // existing super admin

      await expect(service.promoteToSuperAdmin('2', requester)).rejects.toThrow(
        'Já existe um Super Administrador no sistema. Apenas um SUPER_ADMIN é permitido.',
      );
    });

    it('should prevent non-super admin from promoting to super admin', async () => {
      const requester = {
        id: '1',
        email: 'requester@example.com',
        role: UserRole.ADMIN,
        name: 'Requester',
        provider: UserProvider.LOCAL,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        posts: [],
      };

      await expect(service.promoteToSuperAdmin('2', requester)).rejects.toThrow(
        'Apenas super administradores podem promover outros para SUPER_ADMIN',
      );
    });
  });
});
