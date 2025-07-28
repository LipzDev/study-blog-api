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

    // Não permitir criação de SUPER_ADMIN através do método create
    if (userData.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Não é possível criar um Super Administrador através deste método. Use o método específico para promover um usuário a SUPER_ADMIN.',
      );
    }

    // Definir role padrão como USER se não especificado
    const role = userData.role || UserRole.USER;

    const user = this.userRepository.create({
      ...userData,
      role,
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

  /**
   * Busca usuário por ID retornando apenas dados seguros para perfil
   * Exclui campos sensíveis como senha, tokens de verificação e reset
   */
  async findByIdForProfile(
    id: string,
  ): Promise<Omit<
    User,
    | 'password'
    | 'emailVerificationToken'
    | 'resetPasswordToken'
    | 'resetPasswordExpires'
  > | null> {
    return await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'provider',
        'providerId',
        'avatar',
        'bio',
        'github',
        'linkedin',
        'twitter',
        'instagram',
        'emailVerified',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });
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
  async findAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: Omit<
      User,
      | 'password'
      | 'emailVerificationToken'
      | 'resetPasswordToken'
      | 'resetPasswordExpires'
    >[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Contar total de usuários
    const total = await this.userRepository.count();

    // Buscar usuários paginados
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
      skip: offset,
      take: limit,
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca usuários pelo email ou nome (sem incluir dados sensíveis) - para admins
   */
  async searchUser(
    email?: string,
    name?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: Omit<
      User,
      | 'password'
      | 'emailVerificationToken'
      | 'resetPasswordToken'
      | 'resetPasswordExpires'
    >[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    if (email) {
      // Busca por email (sempre retorna no máximo 1 resultado)
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
        throw new NotFoundException(`Usuário não encontrado`);
      }

      return {
        users: [user],
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      };
    } else if (name) {
      // Busca por nome com múltiplos resultados
      const nameWords = name
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);

      let queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.role',
          'user.emailVerified',
          'user.provider',
          'user.avatar',
          'user.createdAt',
          'user.updatedAt',
        ]);

      if (nameWords.length > 1) {
        // Para múltiplas palavras, busca por todas as palavras na mesma ordem
        const searchPattern = nameWords.map((word) => `%${word}%`).join(' ');
        queryBuilder = queryBuilder.where(
          'LOWER(user.name) LIKE LOWER(:pattern)',
          { pattern: searchPattern },
        );
      } else {
        // Para uma palavra, busca por nomes que contêm a palavra
        queryBuilder = queryBuilder.where(
          'LOWER(user.name) LIKE LOWER(:pattern)',
          { pattern: `%${name}%` },
        );
      }

      // Adicionar ordenação por relevância (nomes que começam com o termo primeiro)
      queryBuilder = queryBuilder
        .orderBy(
          `CASE WHEN LOWER(user.name) LIKE LOWER('${name}%') THEN 0 ELSE 1 END`,
          'ASC',
        )
        .addOrderBy('user.name', 'ASC');

      // Contar total de resultados
      const total = await queryBuilder.getCount();

      // Buscar resultados paginados
      const users = await queryBuilder.skip(offset).take(limit).getMany();

      if (users.length === 0) {
        throw new NotFoundException(`Usuário não encontrado`);
      }

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    throw new BadRequestException('Email ou nome é obrigatório para busca');
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
    if (
      requester.role === UserRole.SUPER_ADMIN &&
      target.role !== UserRole.SUPER_ADMIN
    ) {
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

    if (user.role !== UserRole.USER) {
      throw new ConflictException(
        'Só é possível promover usuários comuns para ADMIN',
      );
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
      throw new BadRequestException('Só é possível rebaixar ADMIN para USER');
    }

    // Atualizar o role para user
    await this.userRepository.update(userId, { role: UserRole.USER });

    // Buscar o usuário atualizado
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role'],
    });

    this.logger.log(
      `Super admin ${requester.email} revoked admin privileges from user ${user.email}`,
    );

    return {
      message: 'Privilégios de administrador removidos com sucesso',
      user: updatedUser!,
    };
  }

  /**
   * Obtém o Super Administrador atual do sistema
   */
  async getSuperAdmin(): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { role: UserRole.SUPER_ADMIN },
      select: ['id', 'name', 'email', 'role', 'createdAt'],
    });
  }

  /**
   * Verifica se existe um Super Administrador no sistema
   */
  async hasSuperAdmin(): Promise<boolean> {
    const superAdmin = await this.userRepository.findOne({
      where: { role: UserRole.SUPER_ADMIN },
    });
    return !!superAdmin;
  }

  async deleteUser(
    userId: string,
    requester: User,
  ): Promise<{ message: string }> {
    const targetUser = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'role'],
    });
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar permissões
    if (requester.role === UserRole.ADMIN) {
      // Admin só pode excluir usuários comuns
      if (targetUser.role !== UserRole.USER) {
        throw new ForbiddenException(
          'Administradores só podem excluir usuários comuns',
        );
      }
    } else if (requester.role === UserRole.SUPER_ADMIN) {
      // Super Admin não pode excluir outros Super Admins
      if (targetUser.role === UserRole.SUPER_ADMIN) {
        throw new ForbiddenException(
          'Super Administradores não podem excluir outros Super Administradores',
        );
      }
    } else {
      throw new ForbiddenException('Permissão insuficiente');
    }

    await this.userRepository.delete(userId);

    return {
      message: 'Usuário excluído com sucesso',
    };
  }

  async updateUserName(
    userId: string,
    newName: string,
    requester: User,
  ): Promise<{ message: string; user: Partial<User> }> {
    const targetUser = await this.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o nome não está vazio
    if (!newName || newName.trim().length === 0) {
      throw new BadRequestException('Nome não pode estar vazio');
    }

    // Verificar permissões
    if (requester.role === UserRole.ADMIN) {
      // Admin pode alterar nome de qualquer usuário
    } else if (requester.role === UserRole.SUPER_ADMIN) {
      // Super Admin pode alterar nome de qualquer usuário
    } else {
      throw new ForbiddenException('Permissão insuficiente');
    }

    await this.userRepository.update(userId, { name: newName.trim() });

    // Retornar dados atualizados
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException('Erro ao atualizar usuário');
    }

    return {
      message: 'Nome do usuário atualizado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    };
  }

  /**
   * Atualiza o perfil do usuário (apenas o próprio usuário pode atualizar)
   */
  async updateProfile(
    userId: string,
    profileData: {
      name?: string;
      bio?: string;
      github?: string | null;
      linkedin?: string | null;
      twitter?: string | null;
      instagram?: string | null;
    },
  ): Promise<{
    message: string;
    user: Omit<
      User,
      | 'password'
      | 'emailVerificationToken'
      | 'resetPasswordToken'
      | 'resetPasswordExpires'
    >;
  }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (profileData.name !== undefined) {
      if (!profileData.name || profileData.name.trim().length === 0) {
        throw new BadRequestException('Nome não pode estar vazio');
      }
      updateData.name = profileData.name.trim();
    }

    if (profileData.bio !== undefined) {
      updateData.bio = profileData.bio.trim() || null;
    }

    // Validação das redes sociais
    if (profileData.github !== undefined) {
      updateData.github = profileData.github;
      this.logger.debug(`Updating github: ${profileData.github}`);
    }

    if (profileData.linkedin !== undefined) {
      updateData.linkedin = profileData.linkedin;
      this.logger.debug(`Updating linkedin: ${profileData.linkedin}`);
    }

    if (profileData.twitter !== undefined) {
      updateData.twitter = profileData.twitter;
      this.logger.debug(`Updating twitter: ${profileData.twitter}`);
    }

    if (profileData.instagram !== undefined) {
      updateData.instagram = profileData.instagram;
      this.logger.debug(`Updating instagram: ${profileData.instagram}`);
    }

    // Atualizar usuário
    this.logger.debug(`Updating user ${userId} with data:`, updateData);
    await this.userRepository.update(userId, updateData);

    // Retornar dados atualizados
    const updatedUser = await this.findByIdForProfile(userId);
    if (!updatedUser) {
      throw new NotFoundException('Erro ao atualizar perfil');
    }

    this.logger.debug(`Updated user data:`, {
      github: updatedUser.github,
      linkedin: updatedUser.linkedin,
      twitter: updatedUser.twitter,
      instagram: updatedUser.instagram,
    });

    return {
      message: 'Perfil atualizado com sucesso',
      user: updatedUser,
    };
  }

  /**
   * Atualiza o avatar do usuário
   */
  async updateAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<{
    message: string;
    user: Omit<
      User,
      | 'password'
      | 'emailVerificationToken'
      | 'resetPasswordToken'
      | 'resetPasswordExpires'
    >;
  }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.userRepository.update(userId, { avatar: avatarUrl });

    // Retornar dados atualizados
    const updatedUser = await this.findByIdForProfile(userId);
    if (!updatedUser) {
      throw new NotFoundException('Erro ao atualizar avatar');
    }

    return {
      message: 'Avatar atualizado com sucesso',
      user: updatedUser,
    };
  }
}
