import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    void this.initializeTransporter();
  }

  private async initializeTransporter() {
    const isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
    const enableRealEmails =
      this.configService.get<string>('ENABLE_REAL_EMAILS') === 'true';

    if (isDevelopment && !enableRealEmails) {
      // Em desenvolvimento sem emails reais, usar transporter de teste
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
      this.logger.log(
        'Mail service initialized in development mode (no real emails sent)',
      );
    } else {
      // Em produção ou desenvolvimento com emails habilitados
      const mailUser = this.configService.get<string>('MAIL_USER');
      const mailPass = this.configService.get<string>('MAIL_PASS');

      if (!mailUser || !mailPass) {
        this.logger.warn(
          'Email credentials not configured. Emails will not be sent.',
        );
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true,
        });
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
        port: parseInt(this.configService.get<string>('MAIL_PORT', '587')),
        secure: false,
        auth: {
          user: mailUser,
          pass: mailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verificar conexão
      try {
        await this.transporter.verify();
        this.logger.log(
          'Mail service initialized successfully with real email sending',
        );
      } catch (error) {
        this.logger.error('Failed to verify email configuration:', error);
        this.logger.warn('Falling back to development mode (no emails sent)');
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true,
        });
      }
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password?token=${token}`;
    const isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
    const enableRealEmails =
      this.configService.get<string>('ENABLE_REAL_EMAILS') === 'true';
    const shouldSendRealEmail = !isDevelopment || enableRealEmails;

    const mailOptions = {
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@studyblog.com',
      ),
      to: email,
      subject: 'Study Blog - Solicitação de Redefinição de Senha',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Solicitação de Redefinição de Senha</h2>
            <p style="color: #4b5563; line-height: 1.6;">Você solicitou uma redefinição de senha para sua conta do Study Blog.</p>
            <p style="color: #4b5563; line-height: 1.6;">Clique no botão abaixo para redefinir sua senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Redefinir Senha</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Este link expirará em 1 hora.</p>
            <p style="color: #6b7280; font-size: 14px;">Se você não solicitou isso, ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Study Blog - Sua Plataforma de Aprendizado</p>
          </div>
        </div>
      `,
    };

    try {
      if (shouldSendRealEmail) {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Password reset email sent to ${email}`);
      } else {
        // Em desenvolvimento sem emails reais, apenas logar
        this.logger.log(
          `[DEV MODE] Password reset email would be sent to ${email}`,
        );
        this.logger.log(`[DEV MODE] Reset URL: ${resetUrl}`);
        this.logger.log(`[DEV MODE] Token: ${token}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      // Em desenvolvimento, não falhar por causa do email
      if (shouldSendRealEmail) {
        throw error;
      }
    }
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/verify-email?token=${token}`;
    const isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
    const enableRealEmails =
      this.configService.get<string>('ENABLE_REAL_EMAILS') === 'true';
    const shouldSendRealEmail = !isDevelopment || enableRealEmails;

    const mailOptions = {
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@studyblog.com',
      ),
      to: email,
      subject: 'Study Blog - Verifique seu Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Bem-vindo ao Study Blog!</h2>
            <p style="color: #4b5563; line-height: 1.6;">Obrigado por se cadastrar! Verifique seu endereço de email para completar a configuração da sua conta.</p>
            <p style="color: #4b5563; line-height: 1.6;">Clique no botão abaixo para verificar seu email:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Verificar Email</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Se você não criou esta conta, ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Study Blog - Sua Plataforma de Aprendizado</p>
          </div>
        </div>
      `,
    };

    try {
      if (shouldSendRealEmail) {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email verification sent to ${email}`);
      } else {
        // Em desenvolvimento sem emails reais, apenas logar
        this.logger.log(
          `[DEV MODE] Email verification would be sent to ${email}`,
        );
        this.logger.log(`[DEV MODE] Verification URL: ${verificationUrl}`);
        this.logger.log(`[DEV MODE] Token: ${token}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email verification to ${email}`, error);
      // Em desenvolvimento, não falhar por causa do email
      if (shouldSendRealEmail) {
        throw error;
      }
    }
  }
}
