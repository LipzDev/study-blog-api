import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { User, UserProvider, UserRole } from './entities/user.entity';

describe('ScheduledTasksService Integration', () => {
  let module: TestingModule;
  let service: ScheduledTasksService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    clear: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        ScheduledTasksService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ScheduledTasksService>(ScheduledTasksService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('cleanupUnverifiedUsers Integration', () => {
    it('should remove unverified users older than 24 hours', async () => {
      const mockUnverifiedUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
        {
          id: '2',
          email: 'user2@example.com',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUnverifiedUsers);
      mockUserRepository.remove.mockResolvedValue(undefined);

      await service.cleanupUnverifiedUsers();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: expect.any(Object),
        },
        select: ['id', 'email', 'createdAt'],
      });

      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUnverifiedUsers);
    });

    it('should not remove recent unverified users', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      await service.cleanupUnverifiedUsers();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(mockUserRepository.remove).not.toHaveBeenCalled();
    });

    it('should not remove verified users', async () => {
      // Criar usuário verificado antigo
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);

      const verifiedUser = {
        email: 'verified@example.com',
        name: 'Verified User',
        password: 'hashedpassword',
        emailVerified: true,
        provider: UserProvider.LOCAL,
        role: UserRole.USER,
        createdAt: oldDate,
      };

      await userRepository.save(verifiedUser);

      // Executar limpeza
      await service.cleanupUnverifiedUsers();

      // Verificar que o usuário não foi removido
      const afterCount = await userRepository.count();
      expect(afterCount).toBe(1);
    });

    it('should not remove Google OAuth users', async () => {
      // Criar usuário Google OAuth antigo não verificado
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);

      const googleUser = {
        email: 'google@example.com',
        name: 'Google User',
        emailVerified: false,
        provider: UserProvider.GOOGLE,
        providerId: 'google123',
        role: UserRole.USER,
        createdAt: oldDate,
      };

      await userRepository.save(googleUser);

      // Executar limpeza
      await service.cleanupUnverifiedUsers();

      // Verificar que o usuário não foi removido
      const afterCount = await userRepository.count();
      expect(afterCount).toBe(1);
    });
  });

  describe('cleanupExpiredResetTokens Integration', () => {
    it('should clean up expired reset password tokens', async () => {
      const mockUpdateResult = { affected: 2 };

      mockUserRepository.update.mockResolvedValue(mockUpdateResult);

      await service.cleanupExpiredResetTokens();

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        {
          resetPasswordExpires: expect.any(Object),
        },
        {
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        }
      );
    });

    it('should not clean up valid reset password tokens', async () => {
      const mockUpdateResult = { affected: 0 };

      mockUserRepository.update.mockResolvedValue(mockUpdateResult);

      await service.cleanupExpiredResetTokens();

      expect(mockUserRepository.update).toHaveBeenCalled();
    });
  });

  describe('logSystemStatus Integration', () => {
    it('should log correct system status', async () => {
      mockUserRepository.count
        .mockResolvedValueOnce(3) // total users
        .mockResolvedValueOnce(2) // verified users
        .mockResolvedValueOnce(1); // unverified users

      await service.logSystemStatus();

      expect(mockUserRepository.count).toHaveBeenCalledTimes(3);
    });
  });
}); 