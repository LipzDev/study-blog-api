import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserProvider, UserRole } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let registerSpy: jest.SpyInstance;
  let loginSpy: jest.SpyInstance;
  let forgotPasswordSpy: jest.SpyInstance;
  let resetPasswordSpy: jest.SpyInstance;
  let verifyEmailSpy: jest.SpyInstance;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
    googleLogin: jest.fn(),
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
    authService = module.get<AuthService>(AuthService);

    // Initialize spies
    registerSpy = jest.spyOn(authService, 'register');
    loginSpy = jest.spyOn(authService, 'login');
    forgotPasswordSpy = jest.spyOn(authService, 'forgotPassword');
    resetPasswordSpy = jest.spyOn(authService, 'resetPassword');
    verifyEmailSpy = jest.spyOn(authService, 'verifyEmail');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const expectedResult = {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: false,
          provider: 'local',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        access_token: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(registerSpy).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when user already exists', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('User with this email already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const expectedResult = {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          provider: UserProvider.LOCAL,
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
          posts: [],
        },
        access_token: 'jwt-token',
      };

      const mockRequest = {
        body: loginDto,
        user: expectedResult.user,
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(mockRequest);

      expect(loginSpy).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'john@example.com',
      };

      const expectedResult = {
        message: 'If the email exists, a reset link has been sent',
      };

      mockAuthService.forgotPassword.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(forgotPasswordSpy).toHaveBeenCalledWith(forgotPasswordDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'reset-token',
        password: 'newpassword123',
      };

      const expectedResult = {
        message: 'Password has been reset successfully',
      };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(resetPasswordSpy).toHaveBeenCalledWith(resetPasswordDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error for invalid token', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'invalid-token',
        password: 'newpassword123',
      };

      mockAuthService.resetPassword.mockRejectedValue(
        new Error('Invalid or expired reset token'),
      );

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'verification-token';
      const expectedResult = {
        message: 'Email verified successfully',
      };

      mockAuthService.verifyEmail.mockResolvedValue(expectedResult);

      const result = await controller.verifyEmail(token);

      expect(verifyEmailSpy).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error for invalid verification token', async () => {
      const token = 'invalid-token';

      mockAuthService.verifyEmail.mockRejectedValue(
        new Error('Invalid verification token'),
      );

      await expect(controller.verifyEmail(token)).rejects.toThrow(
        'Invalid verification token',
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: true,
        provider: UserProvider.LOCAL,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
        posts: [],
      };

      const mockRequest = {
        user: mockUser,
      } as any;

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });
});
