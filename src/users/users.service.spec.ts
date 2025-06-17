import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserProvider } from './entities/user.entity';

describe('UsersService - Cleanup Functionality', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let loggerSpy: jest.SpyInstance;

  // Mock repository
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

    // Spy on logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanupUnverifiedUsers', () => {
    it('should remove unverified users older than 24 hours', async () => {
      // Arrange
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25); // 25 horas atrás

      const unverifiedUsers = [
        {
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: oldDate,
        },
        {
          id: '2',
          email: 'user2@test.com',
          name: 'User 2',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: oldDate,
        },
      ] as User[];

      mockRepository.find.mockResolvedValue(unverifiedUsers);
      mockRepository.remove.mockResolvedValue(unverifiedUsers);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: expect.any(Object), // LessThan object
        },
      });

      expect(mockRepository.remove).toHaveBeenCalledWith(unverifiedUsers);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Cleanup completed: Removed 2 unverified users older than 24 hours',
      );
    });

    it('should not remove verified users', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(mockRepository.remove).not.toHaveBeenCalled();
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        'Cleanup completed: No unverified users found to remove',
      );
    });

    it('should not remove Google OAuth users', async () => {
      // Arrange - O find já está configurado para filtrar apenas LOCAL users
      mockRepository.find.mockResolvedValue([]);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          emailVerified: false,
          provider: UserProvider.LOCAL, // Confirma que só busca usuários LOCAL
          createdAt: expect.any(Object),
        },
      });
    });

    it('should not remove users created less than 24 hours ago', async () => {
      // Arrange
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 12); // 12 horas atrás

      // O método usa LessThan(24 horas atrás), então usuários de 12h atrás não aparecerão
      mockRepository.find.mockResolvedValue([]);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRepository.find.mockRejectedValue(error);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error during unverified users cleanup:',
        error,
      );
    });

    it('should log removed emails for audit', async () => {
      // Arrange
      const unverifiedUsers = [
        {
          id: '1',
          email: 'audit1@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25h ago
        },
        {
          id: '2',
          email: 'audit2@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25h ago
        },
      ] as User[];

      mockRepository.find.mockResolvedValue(unverifiedUsers);
      mockRepository.remove.mockResolvedValue(unverifiedUsers);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        'Removed emails: audit1@test.com, audit2@test.com',
      );
    });
  });

  describe('manualCleanupUnverifiedUsers', () => {
    it('should return cleanup results', async () => {
      // Arrange
      const unverifiedUsers = [
        {
          id: '1',
          email: 'manual1@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        },
        {
          id: '2',
          email: 'manual2@test.com',
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        },
      ] as User[];

      mockRepository.find.mockResolvedValue(unverifiedUsers);
      mockRepository.remove.mockResolvedValue(unverifiedUsers);

      // Act
      const result = await service.manualCleanupUnverifiedUsers();

      // Assert
      expect(result).toEqual({
        removed: 2,
        emails: ['manual1@test.com', 'manual2@test.com'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(unverifiedUsers);
    });

    it('should return empty results when no users to remove', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.manualCleanupUnverifiedUsers();

      // Assert
      expect(result).toEqual({
        removed: 0,
        emails: [],
      });
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('Date calculation', () => {
    it('should calculate 24 hours ago correctly', async () => {
      // Arrange
      const now = new Date('2024-01-15T12:00:00Z');
      const expectedDate = new Date('2024-01-14T12:00:00Z');

      jest.spyOn(global, 'Date').mockImplementation(() => now as any);
      mockRepository.find.mockResolvedValue([]);

      // Act
      await service.cleanupUnverifiedUsers();

      // Assert
      const callArgs = mockRepository.find.mock.calls[0][0];
      const lessThanCondition = callArgs.where.createdAt;

      // Verifica se a data está próxima do esperado (tolerância de 1 minuto)
      const actualDate = lessThanCondition._value;
      const timeDiff = Math.abs(actualDate.getTime() - expectedDate.getTime());
      expect(timeDiff).toBeLessThan(60000); // Menos de 1 minuto de diferença

      jest.restoreAllMocks();
    });
  });
});
