import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description:
      'Lista todos os usuários do sistema com informações básicas. Apenas admins podem usar esta funcionalidade.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          name: { type: 'string', example: 'João Silva' },
          email: { type: 'string', example: 'joao@exemplo.com' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          emailVerified: { type: 'boolean', example: true },
          provider: {
            type: 'string',
            enum: ['local', 'google'],
            example: 'local',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Apenas admins podem listar usuários',
  })
  async getAllUsers(@Request() req) {
    // Verificar se o usuário é admin
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem listar usuários',
      );
    }

    return this.usersService.findAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar usuário por email',
    description:
      'Busca um usuário pelo email. Apenas admins podem usar esta funcionalidade.',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    type: String,
    description: 'Email do usuário a ser buscado',
    example: 'usuario@exemplo.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@exemplo.com' },
        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
        emailVerified: { type: 'boolean', example: true },
        provider: {
          type: 'string',
          enum: ['local', 'google'],
          example: 'local',
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Apenas admins podem buscar usuários',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Usuário com email usuario@exemplo.com não encontrado',
        },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  async searchUserByEmail(@Query('email') email: string, @Request() req) {
    // Verificar se o usuário é admin
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem buscar usuários',
      );
    }

    return this.usersService.findByEmailForAdmin(email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/promote-admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Promover usuário a administrador',
    description:
      'Promove um usuário comum ao cargo de administrador. Apenas super admins podem usar esta funcionalidade.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ser promovido',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário promovido a admin com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Usuário promovido a administrador com sucesso',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', example: 'admin' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Apenas super admins podem promover usuários',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuário já é administrador',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Usuário já possui cargo de administrador',
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async promoteToAdmin(@Param('id') id: string, @Request() req) {
    // Verificar se o usuário é super admin
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException(
        'Apenas super administradores podem promover usuários a admin',
      );
    }

    return this.usersService.promoteToAdmin(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/revoke-admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Revogar privilégios de administrador',
    description:
      'Remove o cargo de administrador de um usuário. Apenas super admins podem usar esta funcionalidade.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário que terá os privilégios revogados',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Privilégios de administrador removidos com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Privilégios de administrador removidos com sucesso',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', example: 'user' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso negado - Apenas super admins podem revogar privilégios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuário não é administrador ou é super admin',
  })
  async revokeAdmin(@Param('id') id: string, @Request() req) {
    // Verificar se o usuário é super admin
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException(
        'Apenas super administradores podem revogar privilégios',
      );
    }

    return this.usersService.revokeAdmin(id, req.user);
  }
}
