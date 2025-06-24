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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description:
      'Lista todos os usuários do sistema com informações básicas. Apenas ADMIN e SUPER_ADMIN podem usar esta funcionalidade.',
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
          role: { type: 'string', enum: ['user', 'admin', 'super_admin'], example: 'user' },
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
    description: 'Acesso negado - Apenas ADMIN e SUPER_ADMIN podem listar usuários',
  })
  async getAllUsers() {
    return this.usersService.findAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('search')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar usuário por email',
    description:
      'Busca um usuário pelo email. Apenas ADMIN e SUPER_ADMIN podem usar esta funcionalidade.',
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
        role: { type: 'string', enum: ['user', 'admin', 'super_admin'], example: 'user' },
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
    description: 'Acesso negado - Apenas ADMIN e SUPER_ADMIN podem buscar usuários',
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
  async searchUserByEmail(@Query('email') email: string) {
    return this.usersService.findByEmailForAdmin(email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/promote-admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Promover usuário a administrador',
    description:
      'Promove um usuário comum ao cargo de administrador. Apenas SUPER_ADMIN pode usar esta funcionalidade.',
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
    description: 'Acesso negado - Apenas SUPER_ADMIN pode promover usuários',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário já é administrador',
  })
  async promoteToAdmin(@Param('id') id: string, @Request() req) {
    return this.usersService.promoteToAdmin(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/revoke-admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Revogar privilégios de administrador',
    description:
      'Remove o cargo de administrador de um usuário. Apenas SUPER_ADMIN pode usar esta funcionalidade.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ter privilégios revogados',
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
    description: 'Acesso negado - Apenas SUPER_ADMIN pode revogar privilégios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuário não é administrador',
  })
  async revokeAdmin(@Param('id') id: string, @Request() req) {
    return this.usersService.revokeAdmin(id, req.user);
  }
}
