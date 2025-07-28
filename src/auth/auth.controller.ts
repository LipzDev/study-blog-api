import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthRequest } from '../types/auth.types';
import { FirebaseStorageService } from '../uploads/firebase-storage.service';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { LoginResponseDto, RegisterResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// Interfaces para tipagem adequada
interface AuthenticatedRequest {
  user: User;
  body: LoginDto;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private firebaseStorageService: FirebaseStorageService, // novo
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar um novo usuário',
    description:
      'Cria uma nova conta de usuário. Um email de verificação será enviado para confirmar a conta.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Dados do usuário para registro',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Usuário registrado com sucesso. Verifique seu email para confirmar a conta.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email já está em uso',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login com email e senha',
    description:
      'Autentica um usuário com email e senha, retornando um token JWT para acesso aos endpoints protegidos.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciais de login',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  async login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.body);
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
    if (!token) {
      throw new BadRequestException('Token de verificação é obrigatório');
    }
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
  @ApiOperation({
    summary: 'Obter perfil do usuário atual',
    description: 'Retorna os dados do usuário autenticado via JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário recuperado',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou expirado' })
  async getProfile(@Request() req: JwtAuthRequest): Promise<UserProfileDto> {
    // Buscar dados seguros do usuário diretamente do banco
    const user = await this.usersService.findByIdForProfile(req.user.id);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      providerId: user.providerId,
      avatar: user.avatar,
      bio: user.bio,
      github: user.github,
      linkedin: user.linkedin,
      twitter: user.twitter,
      instagram: user.instagram,
      emailVerified: user.emailVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Delete('cleanup-unverified')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Limpeza manual de usuários não verificados (somente Super Admin)',
    description:
      'Remove usuários que se registraram há mais de 24 horas, mas nunca verificaram o e-mail. Acessível somente por SUPER_ADMIN.',
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
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou expirado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - requer SUPER_ADMIN',
  })
  async manualCleanupUnverifiedUsers() {
    const result = await this.usersService.manualCleanupUnverifiedUsers();

    return {
      message: `Cleanup completed successfully. Removed ${result.removed} unverified users.`,
      removed: result.removed,
      emails: result.emails,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({
    summary: 'Atualizar perfil do usuário',
    description: 'Atualiza os dados do usuário autenticado',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário atualizado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou expirado' })
  async updateProfile(
    @Request() req: JwtAuthRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @ApiOperation({
    summary: 'Upload de avatar do usuário',
    description: 'Carrega um novo avatar para o usuário autenticado',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar do usuário carregado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou expirado' })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: undefined, // buffer em memória
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException(
              'Apenas arquivos de imagem são permitidos!',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(
    @Request() req: JwtAuthRequest,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    if (!avatar) {
      throw new BadRequestException('Arquivo de avatar é obrigatório');
    }
    const avatarUrl = await this.firebaseStorageService.uploadImage(
      avatar,
      'avatars',
    );
    return this.usersService.updateAvatar(req.user.id, avatarUrl);
  }
}
