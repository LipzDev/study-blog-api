import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { User, UserProvider } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

export interface AuthResponse {
  user: Omit<User, 'password' | 'resetPasswordToken' | 'emailVerificationToken'>;
  access_token: string;
}

export interface GoogleUserData {
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create({
      ...registerDto,
      provider: UserProvider.LOCAL,
    });

    // Enviar email de verificação
    if (user.emailVerificationToken) {
      await this.mailService.sendEmailVerification(user.email, user.emailVerificationToken);
    }

    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    const { password, resetPasswordToken, emailVerificationToken, ...userWithoutSensitiveData } = user;

    return {
      user: userWithoutSensitiveData,
      access_token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    const { password, resetPasswordToken, emailVerificationToken, ...userWithoutSensitiveData } = user;

    return {
      user: userWithoutSensitiveData,
      access_token,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.usersService.validatePassword(user, password)) {
      return user;
    }
    return null;
  }

  async validateGoogleUser(googleUser: GoogleUserData): Promise<User> {
    let user = await this.usersService.findByProviderId(googleUser.providerId, UserProvider.GOOGLE);
    
    if (!user) {
      // Verificar se já existe um usuário com este email
      user = await this.usersService.findByEmail(googleUser.email);
      if (user) {
        throw new BadRequestException('User with this email already exists');
      }

      // Criar novo usuário
      user = await this.usersService.create({
        ...googleUser,
        provider: UserProvider.GOOGLE,
        emailVerified: true, // Google emails são sempre verificados
      });
    }

    return user;
  }

  async googleLogin(user: User): Promise<AuthResponse> {
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    const { password, resetPasswordToken, emailVerificationToken, ...userWithoutSensitiveData } = user;

    return {
      user: userWithoutSensitiveData,
      access_token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = await this.usersService.updateResetPasswordToken(user.id);
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.usersService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    await this.usersService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }
}
