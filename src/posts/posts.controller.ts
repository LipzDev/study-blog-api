import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthRequest } from '../types/auth.types';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar uma nova postagem',
    description:
      'Cria uma nova postagem. O authorId é automaticamente definido pelo usuário autenticado via JWT.',
  })
  @ApiBody({
    type: CreatePostDto,
    description: 'Dados da postagem a ser criada',
    examples: {
      example1: {
        summary: 'Exemplo de postagem',
        value: {
          slug: 'minha-primeira-postagem',
          title: 'Minha Primeira Postagem',
          text: 'Este é o conteúdo da minha primeira postagem. Deve ter pelo menos 50 caracteres para ser válido.',
          image: 'https://example.com/image.jpg',
          imagePath: 'image-123456.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Postagem criada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        slug: { type: 'string', example: 'minha-primeira-postagem' },
        title: { type: 'string', example: 'Minha Primeira Postagem' },
        text: { type: 'string', example: 'Este é o conteúdo da postagem...' },
        image: { type: 'string', example: 'https://example.com/image.jpg' },
        imagePath: { type: 'string', example: 'image-123456.jpg' },
        authorId: {
          type: 'string',
          format: 'uuid',
          example: '456e7890-e89b-12d3-a456-426614174001',
        },
        date: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'slug should not be empty',
            'title should not be empty',
            'text should not be empty',
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 },
      },
    },
  })
  create(@Body() createPostDto: CreatePostDto, @Request() req: JwtAuthRequest) {
    return this.postsService.create({
      ...createPostDto,
      authorId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  findAll() {
    return this.postsService.findAll();
  }

  @Get('recent')
  findRecent(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.postsService.findRecent(limit);
  }

  @Get('paginated')
  @ApiOperation({
    summary: 'Buscar postagens com paginação e filtros',
    description:
      'Retorna postagens paginadas com opções de filtro por texto e data',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de itens por página',
    example: 12,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Texto para buscar no título e conteúdo',
    example: 'javascript',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Data inicial (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Data final (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    type: String,
    description:
      'ID do autor para filtrar postagens (usado na rota /admin para usuários não-admin)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  findPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('authorId') authorId?: string,
  ) {
    return this.postsService.findPaginated(
      page,
      limit,
      search,
      startDate,
      endDate,
      authorId,
    );
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar uma postagem',
    description:
      'Atualiza uma postagem existente. Apenas o autor da postagem pode atualizá-la.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID único da postagem',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdatePostDto,
    description:
      'Dados da postagem a serem atualizados (todos os campos são opcionais)',
    examples: {
      example1: {
        summary: 'Atualizar título e conteúdo',
        value: {
          title: 'Título Atualizado',
          text: 'Conteúdo atualizado da postagem com mais informações relevantes.',
        },
      },
      example2: {
        summary: 'Atualizar apenas imagem',
        value: {
          image: 'https://example.com/new-image.jpg',
          imagePath: 'new-image-789.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Postagem atualizada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        slug: { type: 'string', example: 'minha-primeira-postagem' },
        title: { type: 'string', example: 'Título Atualizado' },
        text: { type: 'string', example: 'Conteúdo atualizado da postagem...' },
        image: { type: 'string', example: 'https://example.com/new-image.jpg' },
        imagePath: { type: 'string', example: 'new-image-789.jpg' },
        authorId: {
          type: 'string',
          format: 'uuid',
          example: '456e7890-e89b-12d3-a456-426614174001',
        },
        date: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-02T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['image must be a URL address'],
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Postagem não encontrada',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Post with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Excluir uma postagem',
    description:
      'Exclui uma postagem. Admins podem excluir qualquer postagem, usuários comuns só podem excluir suas próprias postagens.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da postagem a ser excluída',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Postagem excluída com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Postagem excluída com sucesso',
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
      'Acesso negado - Usuário não tem permissão para excluir esta postagem',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Você não tem permissão para excluir esta postagem',
        },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Postagem não encontrada',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Post with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  remove(@Param('id') id: string, @Request() req: JwtAuthRequest) {
    return this.postsService.remove(id, req.user);
  }
}
