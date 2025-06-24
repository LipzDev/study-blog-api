import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { User, UserProvider } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

export interface AuthResponse {
  user: Omit<
    User,
    'password' | 'resetPasswordToken' | 'emailVerificationToken'
  >;
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

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; email: string }> {
    const user = await this.usersService.create({
      ...registerDto,
      provider: UserProvider.LOCAL,
    });

    // Enviar email de verificação
    if (user.emailVerificationToken) {
      await this.mailService.sendEmailVerification(
        user.email,
        user.emailVerificationToken,
      );
    }

    return {
      message:
        'Conta criada com sucesso. Verifique seu email para ativar sua conta antes de fazer login.',
      email: user.email,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar se o email foi confirmado (apenas para usuários locais)
    if (user.provider === UserProvider.LOCAL && !user.emailVerified) {
      throw new UnauthorizedException(
        'Verifique seu email antes de fazer login. Verifique sua caixa de entrada para o link de verificação.',
      );
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    const {
      password,
      resetPasswordToken,
      emailVerificationToken,
      ...userWithoutSensitiveData
    } = user;

    return {
      user: userWithoutSensitiveData,
      access_token,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.usersService.validatePassword(user, password))) {
      return user;
    }
    return null;
  }

  async validateGoogleUser(googleUser: GoogleUserData): Promise<User> {
    let user = await this.usersService.findByProviderId(
      googleUser.providerId,
      UserProvider.GOOGLE,
    );

    if (!user) {
      // Verificar se já existe um usuário com este email
      user = await this.usersService.findByEmail(googleUser.email);
      if (user) {
        throw new BadRequestException('Usuário com este email já existe');
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
    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    const {
      password,
      resetPasswordToken,
      emailVerificationToken,
      ...userWithoutSensitiveData
    } = user;

    return {
      user: userWithoutSensitiveData,
      access_token,
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return {
        message: 'Se o email existir, um link de redefinição foi enviado',
      };
    }

    const resetToken = await this.usersService.updateResetPasswordToken(
      user.id,
    );
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'Se o email existir, um link de redefinição foi enviado',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
    return { message: 'Senha foi redefinida com sucesso' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    await this.usersService.verifyEmail(token);
    return { message: 'Email verificado com sucesso' };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return {
        message:
          'Se o email existir e não estiver verificado, um link de verificação foi enviado',
      };
    }

    if (user.emailVerified) {
      return { message: 'Email já está verificado' };
    }

    // Gerar novo token de verificação se necessário
    if (!user.emailVerificationToken) {
      await this.usersService.generateEmailVerificationToken(user.id);
      // Buscar usuário atualizado
      const updatedUser = await this.usersService.findByEmail(email);
      if (updatedUser?.emailVerificationToken) {
        await this.mailService.sendEmailVerification(
          email,
          updatedUser.emailVerificationToken,
        );
      }
    } else {
      await this.mailService.sendEmailVerification(
        email,
        user.emailVerificationToken,
      );
    }

    return {
      message:
        'Se o email existir e não estiver verificado, um link de verificação foi enviado',
    };
  }

  async checkVerificationStatus(
    email: string,
  ): Promise<{ verified: boolean; message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        verified: false,
        message: 'Usuário não encontrado',
      };
    }

    return {
      verified: user.emailVerified,
      message: user.emailVerified
        ? 'Email está verificado'
        : 'Email ainda não foi verificado',
    };
  }
}
