import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User, UserProvider } from './entities/user.entity';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Limpeza automática de usuários não verificados
   * Executa todos os dias à meia-noite (horário de Brasília)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanup-unverified-users',
    timeZone: 'America/Sao_Paulo',
  })
  async cleanupUnverifiedUsers(): Promise<void> {
    this.logger.log(
      '🕐 Iniciando limpeza automática de usuários não verificados...',
    );

    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const unverifiedUsers = await this.userRepository.find({
        where: {
          emailVerified: false,
          provider: UserProvider.LOCAL,
          createdAt: LessThan(twentyFourHoursAgo),
        },
        select: ['id', 'email', 'createdAt'],
      });

      if (unverifiedUsers.length > 0) {
        const emails = unverifiedUsers.map((user) => user.email);
        await this.userRepository.remove(unverifiedUsers);

        this.logger.log(
          `✅ Limpeza automática concluída: ${unverifiedUsers.length} usuários não verificados removidos`,
        );
        this.logger.log(`📧 Emails removidos: ${emails.join(', ')}`);
      } else {
        this.logger.log(
          'ℹ️ Nenhum usuário não verificado encontrado para remoção automática',
        );
      }
    } catch (error) {
      this.logger.error(
        '❌ Erro durante limpeza automática de usuários não verificados:',
        error,
      );
    }
  }

  /**
   * Limpeza de tokens de redefinição de senha expirados
   * Executa a cada 6 horas
   */
  @Cron('0 */6 * * *', {
    name: 'cleanup-expired-reset-tokens',
    timeZone: 'America/Sao_Paulo',
  })
  async cleanupExpiredResetTokens(): Promise<void> {
    this.logger.log(
      '🕐 Iniciando limpeza de tokens de redefinição expirados...',
    );

    try {
      const now = new Date();

      const result = await this.userRepository.update(
        {
          resetPasswordExpires: LessThan(now),
        },
        {
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      );

      if (result.affected && result.affected > 0) {
        this.logger.log(
          `✅ Limpeza de tokens concluída: ${result.affected} tokens expirados removidos`,
        );
      } else {
        this.logger.log('ℹ️ Nenhum token expirado encontrado para remoção');
      }
    } catch (error) {
      this.logger.error('❌ Erro durante limpeza de tokens expirados:', error);
    }
  }

  /**
   * Log de status do sistema
   * Executa a cada hora
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'system-status-log',
    timeZone: 'America/Sao_Paulo',
  })
  async logSystemStatus(): Promise<void> {
    try {
      const totalUsers = await this.userRepository.count();
      const verifiedUsers = await this.userRepository.count({
        where: { emailVerified: true },
      });
      const unverifiedUsers = await this.userRepository.count({
        where: { emailVerified: false },
      });

      this.logger.log(
        `📊 Status do Sistema - Total: ${totalUsers}, Verificados: ${verifiedUsers}, Não verificados: ${unverifiedUsers}`,
      );
    } catch (error) {
      this.logger.error('❌ Erro ao gerar log de status do sistema:', error);
    }
  }
}
