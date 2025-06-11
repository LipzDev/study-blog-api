import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { User, UserProvider } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockUser: User = {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    password: 'hashedPassword',
    provider: UserProvider.LOCAL,
    providerId: undefined,
    avatar: undefined,
    emailVerified: false,
    emailVerificationToken: 'verification-token',
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: [],
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findByProviderId: jest.fn(),
    validatePassword: jest.fn(),
    updateResetPasswordToken: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockMailService = {
    sendEmailVerification: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const createdUser = { ...mockUser };
      const token = 'jwt-token';

      mockUsersService.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue(token);
      mockMailService.sendEmailVerification.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        provider: UserProvider.LOCAL,
      });
      expect(mailService.sendEmailVerification).toHaveBeenCalledWith(
        createdUser.email,
        createdUser.emailVerificationToken,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: createdUser.email,
        sub: createdUser.id,
      });
      expect(result).toEqual({
        user: expect.objectContaining({
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
        }),
        access_token: token,
      });
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('resetPasswordToken');
      expect(result.user).not.toHaveProperty('emailVerificationToken');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const user = { ...mockUser, emailVerified: true };
      const token = 'jwt-token';

      mockUsersService.findByEmail.mockResolvedValue(user);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result).toEqual({
        user: expect.objectContaining({
          id: user.id,
          email: user.email,
          name: user.name,
        }),
        access_token: token,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      const email = 'john@example.com';
      const password = 'password123';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid credentials', async () => {
      const email = 'john@example.com';
      const password = 'wrongpassword';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('validateGoogleUser', () => {
    it('should create new user for new Google user', async () => {
      const googleUser = {
        providerId: 'google-id',
        email: 'john@gmail.com',
        name: 'John Doe',
        avatar: 'avatar-url',
      };

      mockUsersService.findByProviderId.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        ...mockUser,
        ...googleUser,
        provider: UserProvider.GOOGLE,
        emailVerified: true,
      });

      const result = await service.validateGoogleUser(googleUser);

      expect(usersService.create).toHaveBeenCalledWith({
        ...googleUser,
        provider: UserProvider.GOOGLE,
        emailVerified: true,
      });
      expect(result).toBeDefined();
    });

    it('should return existing Google user', async () => {
      const googleUser = {
        providerId: 'google-id',
        email: 'john@gmail.com',
        name: 'John Doe',
        avatar: 'avatar-url',
      };

      const existingUser = {
        ...mockUser,
        provider: UserProvider.GOOGLE,
        providerId: 'google-id',
      };

      mockUsersService.findByProviderId.mockResolvedValue(existingUser);

      const result = await service.validateGoogleUser(googleUser);

      expect(result).toEqual(existingUser);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if email already exists with different provider', async () => {
      const googleUser = {
        providerId: 'google-id',
        email: 'john@example.com',
        name: 'John Doe',
        avatar: 'avatar-url',
      };

      mockUsersService.findByProviderId.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.validateGoogleUser(googleUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email for existing user', async () => {
      const forgotPasswordDto = { email: 'john@example.com' };
      const resetToken = 'reset-token';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.updateResetPasswordToken.mockResolvedValue(resetToken);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(usersService.updateResetPasswordToken).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        resetToken,
      );
      expect(result.message).toBe(
        'If the email exists, a reset link has been sent',
      );
    });

    it('should return same message for non-existent user', async () => {
      const forgotPasswordDto = { email: 'nonexistent@example.com' };

      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.message).toBe(
        'If the email exists, a reset link has been sent',
      );
      expect(usersService.updateResetPasswordToken).not.toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto = {
        token: 'reset-token',
        password: 'newpassword123',
      };

      mockUsersService.resetPassword.mockResolvedValue(undefined);

      const result = await service.resetPassword(resetPasswordDto);

      expect(usersService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.password,
      );
      expect(result.message).toBe('Password has been reset successfully');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'verification-token';

      mockUsersService.verifyEmail.mockResolvedValue(undefined);

      const result = await service.verifyEmail(token);

      expect(usersService.verifyEmail).toHaveBeenCalledWith(token);
      expect(result.message).toBe('Email verified successfully');
    });
  });
});
