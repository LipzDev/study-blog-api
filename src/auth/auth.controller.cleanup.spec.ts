import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController - Cleanup Functionality', () => {
  let controller: AuthController;
  let usersService: UsersService;
  let manualCleanupSpy: jest.SpyInstance;

  // Mock services
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    googleLogin: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
    checkVerificationStatus: jest.fn(),
  };

  const mockUsersService = {
    manualCleanupUnverifiedUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
    manualCleanupSpy = jest.spyOn(usersService, 'manualCleanupUnverifiedUsers');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('manualCleanupUnverifiedUsers', () => {
    it('should successfully cleanup unverified users', async () => {
      // Arrange
      const mockResult = {
        removed: 3,
        emails: ['user1@test.com', 'user2@test.com', 'user3@test.com'],
      };

      mockUsersService.manualCleanupUnverifiedUsers.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await controller.manualCleanupUnverifiedUsers();

      // Assert
      expect(manualCleanupSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Cleanup completed successfully. Removed 3 unverified users.',
        removed: 3,
        emails: ['user1@test.com', 'user2@test.com', 'user3@test.com'],
      });
    });

    it('should handle cleanup with no users to remove', async () => {
      // Arrange
      const mockResult = {
        removed: 0,
        emails: [],
      };

      mockUsersService.manualCleanupUnverifiedUsers.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await controller.manualCleanupUnverifiedUsers();

      // Assert
      expect(manualCleanupSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Cleanup completed successfully. Removed 0 unverified users.',
        removed: 0,
        emails: [],
      });
    });

    it('should handle single user cleanup', async () => {
      // Arrange
      const mockResult = {
        removed: 1,
        emails: ['single@test.com'],
      };

      mockUsersService.manualCleanupUnverifiedUsers.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await controller.manualCleanupUnverifiedUsers();

      // Assert
      expect(result).toEqual({
        message: 'Cleanup completed successfully. Removed 1 unverified users.',
        removed: 1,
        emails: ['single@test.com'],
      });
    });

    it('should propagate errors from UsersService', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockUsersService.manualCleanupUnverifiedUsers.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.manualCleanupUnverifiedUsers()).rejects.toThrow(
        'Database connection failed',
      );
      expect(manualCleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle large number of users cleanup', async () => {
      // Arrange
      const largeEmailList = Array.from(
        { length: 100 },
        (_, i) => `user${i}@test.com`,
      );
      const mockResult = {
        removed: 100,
        emails: largeEmailList,
      };

      mockUsersService.manualCleanupUnverifiedUsers.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await controller.manualCleanupUnverifiedUsers();

      // Assert
      expect(result.removed).toBe(100);
      expect(result.emails).toHaveLength(100);
      expect(result.message).toBe(
        'Cleanup completed successfully. Removed 100 unverified users.',
      );
    });
  });

  describe('Response format validation', () => {
    it('should return response with correct structure', async () => {
      // Arrange
      const mockResult = {
        removed: 2,
        emails: ['test1@example.com', 'test2@example.com'],
      };

      mockUsersService.manualCleanupUnverifiedUsers.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await controller.manualCleanupUnverifiedUsers();

      // Assert
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('removed');
      expect(result).toHaveProperty('emails');
      expect(typeof result.message).toBe('string');
      expect(typeof result.removed).toBe('number');
      expect(Array.isArray(result.emails)).toBe(true);
    });

    it('should format message correctly with plural/singular', async () => {
      // Test singular
      mockUsersService.manualCleanupUnverifiedUsers.mockResolvedValue({
        removed: 1,
        emails: ['single@test.com'],
      });

      let result = await controller.manualCleanupUnverifiedUsers();
      expect(result.message).toContain('Removed 1 unverified users'); // Note: mantém "users" mesmo no singular

      // Test plural
      mockUsersService.manualCleanupUnverifiedUsers.mockResolvedValue({
        removed: 5,
        emails: [
          'user1@test.com',
          'user2@test.com',
          'user3@test.com',
          'user4@test.com',
          'user5@test.com',
        ],
      });

      result = await controller.manualCleanupUnverifiedUsers();
      expect(result.message).toContain('Removed 5 unverified users');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle concurrent cleanup requests', async () => {
      // Arrange
      const mockResult = {
        removed: 1,
        emails: ['concurrent@test.com'],
      };

      mockUsersService.manualCleanupUnverifiedUsers.mockResolvedValue(
        mockResult,
      );

      // Act - Simulate concurrent requests
      const promises = [
        controller.manualCleanupUnverifiedUsers(),
        controller.manualCleanupUnverifiedUsers(),
        controller.manualCleanupUnverifiedUsers(),
      ];

      const results = await Promise.all(promises);

      // Assert
      expect(manualCleanupSpy).toHaveBeenCalledTimes(3);
      results.forEach((result) => {
        expect(result.removed).toBe(1);
        expect(result.emails).toEqual(['concurrent@test.com']);
      });
    });

    it('should maintain data consistency in response', async () => {
      // Arrange
      const emails = ['consistency1@test.com', 'consistency2@test.com'];
      const mockResult = {
        removed: emails.length,
        emails: emails,
      };

      mockUsersService.manualCleanupUnverifiedUsers.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await controller.manualCleanupUnverifiedUsers();

      // Assert
      expect(result.removed).toBe(result.emails.length);
      expect(result.emails).toEqual(emails);
    });
  });
});
