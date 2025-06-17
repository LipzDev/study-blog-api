import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';
    const enableRealEmails =
      this.configService.get('ENABLE_REAL_EMAILS') === 'true';

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
      const mailUser = this.configService.get('MAIL_USER');
      const mailPass = this.configService.get('MAIL_PASS');

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
        host: this.configService.get('MAIL_HOST', 'smtp.gmail.com'),
        port: parseInt(this.configService.get('MAIL_PORT', '587')),
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
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';
    const enableRealEmails =
      this.configService.get('ENABLE_REAL_EMAILS') === 'true';
    const shouldSendRealEmail = !isDevelopment || enableRealEmails;

    const mailOptions = {
      from: this.configService.get('MAIL_FROM', 'noreply@studyblog.com'),
      to: email,
      subject: 'Study Blog - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #4b5563; line-height: 1.6;">You requested a password reset for your Study Blog account.</p>
            <p style="color: #4b5563; line-height: 1.6;">Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Study Blog - Your Learning Platform</p>
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
    const verificationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${token}`;
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';
    const enableRealEmails =
      this.configService.get('ENABLE_REAL_EMAILS') === 'true';
    const shouldSendRealEmail = !isDevelopment || enableRealEmails;

    const mailOptions = {
      from: this.configService.get('MAIL_FROM', 'noreply@studyblog.com'),
      to: email,
      subject: 'Study Blog - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Study Blog!</h2>
            <p style="color: #4b5563; line-height: 1.6;">Thank you for registering! Please verify your email address to complete your account setup.</p>
            <p style="color: #4b5563; line-height: 1.6;">Click the button below to verify your email:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Verify Email</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you didn't create this account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Study Blog - Your Learning Platform</p>
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
