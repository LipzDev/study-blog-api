import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Res,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../users/entities/user.entity';

// Interfaces para tipagem adequada
interface AuthenticatedRequest {
  user: User;
  body: LoginDto;
}

interface GoogleAuthRequest {
  user: User;
}

interface JwtAuthRequest {
  user: User;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 409, description: 'Usuário já existe' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login com email e senha' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Usuário logado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.body);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login com Google OAuth' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback do Google OAuth' })
  async googleAuthRedirect(
    @Request() req: GoogleAuthRequest,
    @Res() res: Response,
  ) {
    const result = await this.authService.googleLogin(req.user);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}`);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar redefinição de senha' })
  @ApiResponse({
    status: 200,
    description: 'Email de redefinição enviado se usuário existir',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha com token' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  @ApiResponse({ status: 404, description: 'Token inválido ou expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verificar endereço de email' })
  @ApiResponse({ status: 200, description: 'Email verificado com sucesso' })
  @ApiResponse({ status: 404, description: 'Token de verificação inválido' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Reenviar verificação de email' })
  @ApiBody({ type: ForgotPasswordDto }) // Reutilizar DTO que só tem email
  @ApiResponse({
    status: 200,
    description: 'Email de verificação enviado se conta existir',
  })
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }

  @Post('check-verification-status')
  @ApiOperation({ summary: 'Verificar status de verificação de email' })
  @ApiBody({ type: ForgotPasswordDto }) // Reutilizar DTO que só tem email
  @ApiResponse({ status: 200, description: 'Status de verificação verificado' })
  async checkVerificationStatus(@Body() body: { email: string }) {
    return this.authService.checkVerificationStatus(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do usuário atual' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário recuperado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getProfile(@Request() req: JwtAuthRequest) {
    return req.user;
  }

  @Delete('cleanup-unverified')
  @ApiOperation({
    summary: 'Manual cleanup of unverified users (Admin only)',
    description:
      'Removes users who registered more than 24 hours ago but never verified their email',
  })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        removed: { type: 'number' },
        emails: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async manualCleanupUnverifiedUsers() {
    const result = await this.usersService.manualCleanupUnverifiedUsers();

    return {
      message: `Cleanup completed successfully. Removed ${result.removed} unverified users.`,
      removed: result.removed,
      emails: result.emails,
    };
  }
}
