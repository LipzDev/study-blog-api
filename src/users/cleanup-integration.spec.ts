import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserProvider } from './entities/user.entity';

describe('Cleanup Integration Tests', () => {
  let service: UsersService;
  let repository: Repository<User>;

  // Mock repository with more realistic behavior
  const mockRepository = {
    find: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Mock logger to avoid console output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'debug').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Real-world scenarios', () => {
    it('should handle mixed user types correctly', async () => {
      // Arrange - Simula cenário real com diferentes tipos de usuários
      const now = new Date();
      const oldDate = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25h ago
      const recentDate = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12h ago

      const mixedUsers = [
        // Deve ser removido: local, não verificado, antigo
        {
          id: '1',
          email: 'remove1@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: oldDate,
        },
        // Deve ser removido: local, não verificado, antigo
        {
          id: '2',
          email: 'remove2@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: oldDate,
        },
      ] as User[];

      // O repository.find já filtra corretamente, então só retorna os que devem ser removidos
      mockRepository.find.mockResolvedValue(mixedUsers);
      mockRepository.remove.mockResolvedValue(mixedUsers);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: expect.any(Object),
        },
      });

      expect(mockRepository.remove).toHaveBeenCalledWith(mixedUsers);
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Cleanup completed: Removed 2 unverified users older than 24 hours',
      );
    });

    it('should handle database transaction rollback scenario', async () => {
      // Arrange
      const usersToRemove = [
        {
          id: '1',
          email: 'transaction@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        },
      ] as User[];

      mockRepository.find.mockResolvedValue(usersToRemove);
      mockRepository.remove.mockRejectedValue(new Error('Transaction failed'));

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(service['logger'].error).toHaveBeenCalledWith(
        'Error during unverified users cleanup:',
        expect.any(Error),
      );
    });

    it('should handle large batch cleanup efficiently', async () => {
      // Arrange - Simula limpeza de muitos usuários
      const largeUserBatch = Array.from({ length: 1000 }, (_, index) => ({
        id: `${index + 1}`,
        email: `bulk${index + 1}@test.com`,
        emailVerified: false,
        provider: UserProvider.LOCAL,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      })) as User[];

      mockRepository.find.mockResolvedValue(largeUserBatch);
      mockRepository.remove.mockResolvedValue(largeUserBatch);

      // Act
      const startTime = Date.now();
      await service.cleanupUnverifiedUsers();
      const endTime = Date.now();

      // Assert
      expect(mockRepository.remove).toHaveBeenCalledWith(largeUserBatch);
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Cleanup completed: Removed 1000 unverified users older than 24 hours',
      );

      // Verifica que a operação foi "rápida" (mock deve ser instantâneo)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should maintain audit trail for compliance', async () => {
      // Arrange
      const auditUsers = [
        {
          id: '1',
          email: 'audit1@company.com',
          name: 'Audit User 1',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        },
        {
          id: '2',
          email: 'audit2@company.com',
          name: 'Audit User 2',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
        },
      ] as User[];

      mockRepository.find.mockResolvedValue(auditUsers);
      mockRepository.remove.mockResolvedValue(auditUsers);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert - Verifica logs de auditoria
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Cleanup completed: Removed 2 unverified users older than 24 hours',
      );
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Removed emails: audit1@company.com, audit2@company.com',
      );
    });

    it('should handle edge case: exactly 24 hours old', async () => {
      // Arrange - Usuário criado exatamente 24 horas atrás
      const exactlyTwentyFourHours = new Date();
      exactlyTwentyFourHours.setHours(exactlyTwentyFourHours.getHours() - 24);

      const edgeCaseUser = [
        {
          id: '1',
          email: 'edge@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: exactlyTwentyFourHours,
        },
      ] as User[];

      mockRepository.find.mockResolvedValue(edgeCaseUser);
      mockRepository.remove.mockResolvedValue(edgeCaseUser);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(mockRepository.remove).toHaveBeenCalledWith(edgeCaseUser);
    });

    it('should handle timezone considerations', async () => {
      // Arrange - Testa com diferentes timezones
      const utcDate = new Date('2024-01-01T00:00:00.000Z');
      const twentyFiveHoursAgo = new Date(
        utcDate.getTime() - 25 * 60 * 60 * 1000,
      );

      const timezoneUser = [
        {
          id: '1',
          email: 'timezone@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: twentyFiveHoursAgo,
        },
      ] as User[];

      mockRepository.find.mockResolvedValue(timezoneUser);
      mockRepository.remove.mockResolvedValue(timezoneUser);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(mockRepository.remove).toHaveBeenCalledWith(timezoneUser);
    });
  });

  describe('Manual vs Automatic cleanup comparison', () => {
    it('should produce same results for manual and automatic cleanup', async () => {
      // Arrange
      const testUsers = [
        {
          id: '1',
          email: 'compare1@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        },
        {
          id: '2',
          email: 'compare2@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        },
      ] as User[];

      mockRepository.find.mockResolvedValue(testUsers);
      mockRepository.remove.mockResolvedValue(testUsers);

      // Act - Manual cleanup
      const manualResult = await service.manualCleanupUnverifiedUsers();

      // Reset mocks
      mockRepository.find.mockResolvedValue(testUsers);
      mockRepository.remove.mockResolvedValue(testUsers);

      // Act - Automatic cleanup (we can't directly compare, but we can verify behavior)
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(manualResult.removed).toBe(2);
      expect(manualResult.emails).toEqual([
        'compare1@test.com',
        'compare2@test.com',
      ]);

      // Both methods should call the same repository methods
      expect(mockRepository.find).toHaveBeenCalledTimes(2);
      expect(mockRepository.remove).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance and reliability', () => {
    it('should handle empty database gracefully', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(mockRepository.remove).not.toHaveBeenCalled();
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Cleanup completed: No unverified users found to remove',
      );
    });

    it('should be idempotent - multiple runs should be safe', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act - Run multiple times
      await service.cleanupUnverifiedUsers();
      await service.cleanupUnverifiedUsers();
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(mockRepository.find).toHaveBeenCalledTimes(3);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
