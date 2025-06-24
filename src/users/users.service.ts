import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User, UserProvider, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

export interface CreateUserData {
  email: string;
  name: string;
  password?: string;
  provider?: UserProvider;
  providerId?: string;
  avatar?: string;
  emailVerified?: boolean;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: CreateUserData): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Usuário com este email já existe');
    }

    const user = this.userRepository.create({
      ...userData,
      password: userData.password
        ? await bcrypt.hash(userData.password, 12)
        : undefined,
      emailVerificationToken:
        userData.provider === UserProvider.LOCAL
          ? crypto.randomBytes(32).toString('hex')
          : undefined,
    });

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByProviderId(
    providerId: string,
    provider: UserProvider,
  ): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { providerId, provider },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return await bcrypt.compare(password, user.password);
  }

  async updateResetPasswordToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    await this.userRepository.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new NotFoundException('Token de redefinição inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Token de verificação inválido');
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: undefined,
    });
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    await this.userRepository.update(userId, {
      emailVerificationToken: token,
    });
    return token;
  }

  /**
   * Limpa usuários não verificados automaticamente (executado diariamente)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupUnverifiedUsers(): Promise<void> {
    this.logger.log('Iniciando limpeza automática de usuários não verificados...');

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const unverifiedUsers = await this.userRepository.find({
      where: {
        emailVerified: false,
        provider: UserProvider.LOCAL,
        createdAt: LessThan(twentyFourHoursAgo),
      },
    });

    if (unverifiedUsers.length > 0) {
      await this.userRepository.remove(unverifiedUsers);
      this.logger.log(
        `Removidos ${unverifiedUsers.length} usuários não verificados`,
      );
    } else {
      this.logger.log('Nenhum usuário não verificado encontrado para remoção');
    }
  }

  /**
   * Limpeza manual de usuários não verificados
   */
  async manualCleanupUnverifiedUsers(): Promise<{
    removed: number;
    emails: string[];
  }> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const unverifiedUsers = await this.userRepository.find({
      where: {
        emailVerified: false,
        provider: UserProvider.LOCAL,
        createdAt: LessThan(twentyFourHoursAgo),
      },
    });

    const removedEmails = unverifiedUsers.map((user) => user.email);

    if (unverifiedUsers.length > 0) {
      await this.userRepository.remove(unverifiedUsers);
    }

    return {
      removed: unverifiedUsers.length,
      emails: removedEmails,
    };
  }

  /**
   * Lista todos os usuários (sem incluir dados sensíveis) - para admins
   */
  async findAllUsers(): Promise<
    Omit<
      User,
      | 'password'
      | 'emailVerificationToken'
      | 'resetPasswordToken'
      | 'resetPasswordExpires'
    >[]
  > {
    const users = await this.userRepository.find({
      select: [
        'id',
        'name',
        'email',
        'role',
        'emailVerified',
        'provider',
        'avatar',
        'createdAt',
        'updatedAt',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return users;
  }

  /**
   * Busca um usuário pelo email (sem incluir dados sensíveis) - para admins
   */
  async findByEmailForAdmin(
    email: string,
  ): Promise<
    Omit<
      User,
      | 'password'
      | 'emailVerificationToken'
      | 'resetPasswordToken'
      | 'resetPasswordExpires'
    >
  > {
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'name',
        'email',
        'role',
        'emailVerified',
        'provider',
        'avatar',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com email ${email} não encontrado`);
    }

    return user;
  }

  /**
   * Verifica se um usuário pode modificar outro baseado na hierarquia
   */
  private canModifyUser(requester: User, target: User): boolean {
    // Apenas SUPER_ADMIN pode promover/revogar admins
    if (requester.role === UserRole.SUPER_ADMIN && target.role !== UserRole.SUPER_ADMIN) {
      return true;
    }

    return false;
  }

  /**
   * Promove um usuário ao cargo de administrador
   */
  async promoteToAdmin(
    userId: string,
    requester: User,
  ): Promise<{ message: string; user: Partial<User> }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new ConflictException('Usuário já possui cargo de administrador');
    }

    // Verificar se o solicitante pode promover este usuário
    if (!this.canModifyUser(requester, user)) {
      throw new ForbiddenException(
        'Você não tem permissão para promover este usuário',
      );
    }

    // Atualizar o role para admin
    await this.userRepository.update(userId, { role: UserRole.ADMIN });

    // Buscar o usuário atualizado
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role'],
    });

    // Log da ação
    this.logger.log(
      `User ${requester.email} promoted user ${user.email} to admin`,
    );

    return {
      message: 'Usuário promovido a administrador com sucesso',
      user: updatedUser!,
    };
  }

  /**
   * Remove o cargo de administrador de um usuário (apenas SUPER_ADMIN)
   */
  async revokeAdmin(
    userId: string,
    requester: User,
  ): Promise<{ message: string; user: Partial<User> }> {
    // Apenas SUPER_ADMIN pode revogar admin
    if (requester.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Apenas super administradores podem revogar privilégios de admin',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Usuário não é administrador');
    }

    // Atualizar o role para user
    await this.userRepository.update(userId, { role: UserRole.USER });

    // Buscar o usuário atualizado
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role'],
    });

    // Log da ação
    this.logger.log(
      `Super admin ${requester.email} revoked admin privileges from user ${user.email}`,
    );

    return {
      message: 'Privilégios de administrador removidos com sucesso',
      user: updatedUser!,
    };
  }
}
