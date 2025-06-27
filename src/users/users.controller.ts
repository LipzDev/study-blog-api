import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import { JwtAuthRequest } from '../types/auth.types';

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
      'Lista todos os usuários do sistema com informações básicas e paginação. Apenas ADMIN e SUPER_ADMIN podem usar esta funcionalidade.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de resultados por página (padrão: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        users: {
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
              role: {
                type: 'string',
                enum: ['user', 'admin', 'super_admin'],
                example: 'user',
              },
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
        total: { type: 'number', example: 73 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 8 },
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
      'Acesso negado - Apenas ADMIN e SUPER_ADMIN podem listar usuários',
  })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pageNumber = page ? Math.max(1, page) : 1;
    const limitNumber = limit ? Math.min(50, Math.max(1, limit)) : 10;

    return this.usersService.findAllUsers(pageNumber, limitNumber);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('search')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar usuários por email ou nome',
    description:
      'Busca usuários pelo email ou nome. Retorna múltiplos resultados para busca por nome. Apenas ADMIN e SUPER_ADMIN podem usar esta funcionalidade.',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Email do usuário a ser buscado',
    example: 'usuario@exemplo.com',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Nome do usuário a ser buscado',
    example: 'João Silva',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de resultados por página (padrão: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuários encontrados com sucesso',
    schema: {
      type: 'object',
      properties: {
        users: {
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
              role: {
                type: 'string',
                enum: ['user', 'admin', 'super_admin'],
                example: 'user',
              },
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
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 3 },
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
      'Acesso negado - Apenas ADMIN e SUPER_ADMIN podem buscar usuários',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Usuário não encontrado',
        },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  async searchUser(
    @Query('email') email?: string,
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!email && !name) {
      throw new BadRequestException('Email ou nome é obrigatório para busca');
    }

    const pageNumber = page ? Math.max(1, page) : 1;
    const limitNumber = limit ? Math.min(50, Math.max(1, limit)) : 10;

    return this.usersService.searchUser(email, name, pageNumber, limitNumber);
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
  async promoteToAdmin(
    @Param('id') id: string,
    @Request() req: JwtAuthRequest,
  ) {
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
  async revokeAdmin(@Param('id') id: string, @Request() req: JwtAuthRequest) {
    return this.usersService.revokeAdmin(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('scheduled-tasks/status')
  @ApiOperation({
    summary: 'Verificar status das tarefas agendadas (Super Admin only)',
    description: 'Retorna informações sobre as tarefas agendadas do sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Status das tarefas agendadas',
    schema: {
      type: 'object',
      properties: {
        cleanupUnverifiedUsers: {
          type: 'object',
          properties: {
            schedule: { type: 'string' },
            timeZone: { type: 'string' },
            description: { type: 'string' },
          },
        },
        cleanupExpiredResetTokens: {
          type: 'object',
          properties: {
            schedule: { type: 'string' },
            timeZone: { type: 'string' },
            description: { type: 'string' },
          },
        },
        systemStatusLog: {
          type: 'object',
          properties: {
            schedule: { type: 'string' },
            timeZone: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou expirado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - requer SUPER_ADMIN',
  })
  getScheduledTasksStatus() {
    return {
      cleanupUnverifiedUsers: {
        schedule: '0 0 * * *',
        timeZone: 'America/Sao_Paulo',
        description:
          'Limpeza automática de usuários não verificados (diariamente à meia-noite)',
      },
      cleanupExpiredResetTokens: {
        schedule: '0 */6 * * *',
        timeZone: 'America/Sao_Paulo',
        description:
          'Limpeza de tokens de redefinição expirados (a cada 6 horas)',
      },
      systemStatusLog: {
        schedule: '0 * * * *',
        timeZone: 'America/Sao_Paulo',
        description: 'Log de status do sistema (a cada hora)',
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('super-admin')
  @ApiOperation({
    summary: 'Obter Super Administrador atual (Admin/Super Admin only)',
    description: 'Retorna informações do Super Administrador atual do sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Super Administrador encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum Super Administrador encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - requer ADMIN ou SUPER_ADMIN',
  })
  async getSuperAdmin() {
    const superAdmin = await this.usersService.getSuperAdmin();
    if (!superAdmin) {
      throw new NotFoundException(
        'Nenhum Super Administrador encontrado no sistema',
      );
    }
    return superAdmin;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('super-admin/exists')
  @ApiOperation({
    summary: 'Verificar se existe Super Administrador (Admin/Super Admin only)',
    description: 'Verifica se existe um Super Administrador no sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status verificado',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - requer ADMIN ou SUPER_ADMIN',
  })
  async hasSuperAdmin() {
    const exists = await this.usersService.hasSuperAdmin();
    return { exists };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Excluir usuário',
    description:
      'Exclui um usuário do sistema. ADMIN pode excluir apenas usuários comuns, SUPER_ADMIN pode excluir qualquer usuário exceto outros SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ser excluído',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário excluído com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Usuário excluído com sucesso',
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
    description: 'Acesso negado - Permissões insuficientes',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async deleteUser(@Param('id') id: string, @Request() req: JwtAuthRequest) {
    return this.usersService.deleteUser(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id/name')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar nome do usuário',
    description:
      'Atualiza o nome de um usuário. ADMIN e SUPER_ADMIN podem usar esta funcionalidade.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ter o nome atualizado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Novo nome do usuário',
          example: 'João Silva',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Nome do usuário atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Nome do usuário atualizado com sucesso',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
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
    description: 'Acesso negado - Permissões insuficientes',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async updateUserName(
    @Param('id') id: string,
    @Body() body: { name: string },
    @Request() req,
  ) {
    return this.usersService.updateUserName(id, body.name, req.user);
  }
}
