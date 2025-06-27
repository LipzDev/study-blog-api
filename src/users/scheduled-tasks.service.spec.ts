import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { User, UserProvider } from './entities/user.entity';

describe('ScheduledTasksService', () => {
  let service: ScheduledTasksService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanupUnverifiedUsers', () => {
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

      await service.manualCleanupUnverifiedUsers();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: expect.any(Object),
        },
        select: ['id', 'email', 'createdAt'],
      });

      expect(mockUserRepository.remove).toHaveBeenCalledWith(
        mockUnverifiedUsers,
      );
    });

    it('should handle case when no unverified users found', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      await service.manualCleanupUnverifiedUsers();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(mockUserRepository.remove).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockUserRepository.find.mockRejectedValue(error);

      // Não precisamos testar o log de erro, apenas garantir que não quebra
      await expect(
        service.manualCleanupUnverifiedUsers(),
      ).resolves.not.toThrow();
    });
  });

  describe('cleanupExpiredResetTokens', () => {
    it('should clean up expired reset password tokens', async () => {
      const mockUpdateResult = { affected: 3 };

      mockUserRepository.update.mockResolvedValue(mockUpdateResult);

      await service.cleanupExpiredResetTokens();

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        {
          resetPasswordExpires: expect.any(Object),
        },
        {
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      );
    });

    it('should handle case when no expired tokens found', async () => {
      const mockUpdateResult = { affected: 0 };

      mockUserRepository.update.mockResolvedValue(mockUpdateResult);

      await service.cleanupExpiredResetTokens();

      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockUserRepository.update.mockRejectedValue(error);

      // Não precisamos testar o log de erro, apenas garantir que não quebra
      await expect(service.cleanupExpiredResetTokens()).resolves.not.toThrow();
    });
  });

  describe('logSystemStatus', () => {
    it('should log system status with user counts', async () => {
      mockUserRepository.count
        .mockResolvedValueOnce(100) // total users
        .mockResolvedValueOnce(90) // verified users
        .mockResolvedValueOnce(10); // unverified users

      await service.logSystemStatus();

      expect(mockUserRepository.count).toHaveBeenCalledTimes(3);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockUserRepository.count.mockRejectedValue(error);

      // Não precisamos testar o log de erro, apenas garantir que não quebra
      await expect(service.logSystemStatus()).resolves.not.toThrow();
    });
  });
});
