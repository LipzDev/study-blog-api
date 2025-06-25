import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

// Mock do nodemailer
jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;
  let mockTransporter: any;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Reset dos mocks
    jest.clearAllMocks();
    
    // Mock do transporter
    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn(),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve inicializar em modo desenvolvimento sem emails reais', async () => {
      // Configurar mocks para modo desenvolvimento
      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce(false) // ENABLE_REAL_EMAILS
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      // Recriar o serviço para testar a inicialização
      const newService = new MailService(configService);
      
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    });

    it('deve inicializar com configuração de email real quando credenciais estão disponíveis', async () => {
      // Configurar mocks para modo produção
      mockConfigService.get
        .mockReturnValueOnce('production') // NODE_ENV
        .mockReturnValueOnce('test@example.com') // MAIL_USER
        .mockReturnValueOnce('password123') // MAIL_PASS
        .mockReturnValueOnce('smtp.gmail.com') // MAIL_HOST
        .mockReturnValueOnce('587') // MAIL_PORT
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      mockTransporter.verify.mockResolvedValue(true);

      const newService = new MailService(configService);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password123',
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    });

    it('deve fallback para modo desenvolvimento quando verificação falha', async () => {
      // Configurar mocks para modo produção com falha na verificação
      mockConfigService.get
        .mockReturnValueOnce('production') // NODE_ENV
        .mockReturnValueOnce('test@example.com') // MAIL_USER
        .mockReturnValueOnce('password123') // MAIL_PASS
        .mockReturnValueOnce('smtp.gmail.com') // MAIL_HOST
        .mockReturnValueOnce('587') // MAIL_PORT
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));

      const newService = new MailService(configService);

      // Deve chamar createTransport duas vezes: uma para produção e outra para fallback
      expect(nodemailer.createTransport).toHaveBeenCalledTimes(2);
    });

    it('deve fallback para modo desenvolvimento quando credenciais não estão configuradas', async () => {
      // Configurar mocks para modo produção sem credenciais
      mockConfigService.get
        .mockReturnValueOnce('production') // NODE_ENV
        .mockReturnValueOnce(null) // MAIL_USER
        .mockReturnValueOnce(null) // MAIL_PASS
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      const newService = new MailService(configService);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('deve enviar email de reset de senha em modo desenvolvimento (apenas log)', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';

      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce(false) // ENABLE_REAL_EMAILS
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.sendPasswordResetEmail(email, token);

      expect(loggerSpy).toHaveBeenCalledWith(
        '[DEV MODE] Password reset email would be sent to test@example.com'
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        '[DEV MODE] Reset URL: http://localhost:3000/reset-password?token=reset-token-123'
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        '[DEV MODE] Token: reset-token-123'
      );
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('deve enviar email real quando ENABLE_REAL_EMAILS=true em desenvolvimento', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';

      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce('true') // ENABLE_REAL_EMAILS
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      mockTransporter.sendMail.mockResolvedValue(true);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.sendPasswordResetEmail(email, token);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@studyblog.com',
        to: email,
        subject: 'Study Blog - Solicitação de Redefinição de Senha',
        html: expect.stringContaining('Solicitação de Redefinição de Senha'),
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        'Password reset email sent to test@example.com'
      );
    });

    it('deve enviar email real em modo produção', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';

      mockConfigService.get
        .mockReturnValueOnce('production') // NODE_ENV
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      mockTransporter.sendMail.mockResolvedValue(true);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.sendPasswordResetEmail(email, token);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@studyblog.com',
        to: email,
        subject: 'Study Blog - Solicitação de Redefinição de Senha',
        html: expect.stringContaining('Solicitação de Redefinição de Senha'),
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        'Password reset email sent to test@example.com'
      );
    });

    it('deve lidar com erro no envio de email em modo desenvolvimento', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';

      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce('true') // ENABLE_REAL_EMAILS
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(service.sendPasswordResetEmail(email, token)).rejects.toThrow('SMTP error');
      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to send password reset email to test@example.com',
        error
      );
    });

    it('deve não falhar em modo desenvolvimento quando ENABLE_REAL_EMAILS=false e há erro', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';

      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce(false) // ENABLE_REAL_EMAILS
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await service.sendPasswordResetEmail(email, token);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to send password reset email to test@example.com',
        error
      );
    });
  });

  describe('sendEmailVerification', () => {
    it('deve enviar email de verificação em modo desenvolvimento (apenas log)', async () => {
      const email = 'test@example.com';
      const token = 'verification-token-123';

      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce(false) // ENABLE_REAL_EMAILS
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.sendEmailVerification(email, token);

      expect(loggerSpy).toHaveBeenCalledWith(
        '[DEV MODE] Email verification would be sent to test@example.com'
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        '[DEV MODE] Verification URL: http://localhost:3000/verify-email?token=verification-token-123'
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        '[DEV MODE] Token: verification-token-123'
      );
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('deve enviar email real de verificação quando ENABLE_REAL_EMAILS=true', async () => {
      const email = 'test@example.com';
      const token = 'verification-token-123';

      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce('true') // ENABLE_REAL_EMAILS
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      mockTransporter.sendMail.mockResolvedValue(true);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.sendEmailVerification(email, token);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@studyblog.com',
        to: email,
        subject: 'Study Blog - Verifique seu Email',
        html: expect.stringContaining('Bem-vindo ao Study Blog!'),
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        'Email verification sent to test@example.com'
      );
    });

    it('deve lidar com erro no envio de email de verificação em modo desenvolvimento', async () => {
      const email = 'test@example.com';
      const token = 'verification-token-123';

      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce('true') // ENABLE_REAL_EMAILS
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(service.sendEmailVerification(email, token)).rejects.toThrow('SMTP error');
      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to send email verification to test@example.com',
        error
      );
    });
  });

  describe('Configurações de URL', () => {
    it('deve usar FRONTEND_URL personalizado', async () => {
      const email = 'test@example.com';
      const token = 'test-token';

      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce('true') // ENABLE_REAL_EMAILS
        .mockReturnValueOnce('https://meuapp.com') // FRONTEND_URL
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      mockTransporter.sendMail.mockResolvedValue(true);

      await service.sendPasswordResetEmail(email, token);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://meuapp.com/reset-password?token=test-token'),
        })
      );
    });

    it('deve usar URL padrão quando FRONTEND_URL não está configurado', async () => {
      const email = 'test@example.com';
      const token = 'test-token';

      mockConfigService.get
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce('true') // ENABLE_REAL_EMAILS
        .mockReturnValueOnce(undefined) // FRONTEND_URL (não configurado)
        .mockReturnValueOnce('noreply@studyblog.com'); // MAIL_FROM

      mockTransporter.sendMail.mockResolvedValue(true);

      await service.sendPasswordResetEmail(email, token);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('http://localhost:3000/reset-password?token=test-token'),
        })
      );
    });
  });
}); 