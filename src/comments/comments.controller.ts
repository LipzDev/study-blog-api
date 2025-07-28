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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar comentário',
    description:
      'Cria um novo comentário em uma postagem específica. Requer autenticação.',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID da postagem onde o comentário será criado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CreateCommentDto,
    description: 'Dados do comentário a ser criado',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comentário criado com sucesso',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Postagem não encontrada',
  })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Param('postId') postId: string,
    @Request() req: { user: User },
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(createCommentDto, postId, req.user);
  }

  @Get('post/:postId')
  @ApiOperation({
    summary: 'Listar comentários de uma postagem',
    description:
      'Retorna todos os comentários de uma postagem específica, ordenados por data de criação (mais antigos primeiro).',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID da postagem para buscar os comentários',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de comentários retornada com sucesso',
    type: [CommentResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Postagem não encontrada',
  })
  async findAllByPost(
    @Param('postId') postId: string,
  ): Promise<CommentResponseDto[]> {
    return this.commentsService.findAllByPost(postId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar comentário específico',
    description: 'Retorna um comentário específico pelo ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do comentário a ser buscado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comentário encontrado com sucesso',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comentário não encontrado',
  })
  async findOne(@Param('id') id: string): Promise<CommentResponseDto> {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar comentário',
    description:
      'Atualiza um comentário existente. Apenas o autor do comentário pode editá-lo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do comentário a ser atualizado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateCommentDto,
    description: 'Dados do comentário a ser atualizado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comentário atualizado com sucesso',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não tem permissão para editar este comentário',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comentário não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: { user: User },
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(id, updateCommentDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Excluir comentário',
    description:
      'Exclui um comentário. Apenas o autor do comentário pode excluí-lo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do comentário a ser excluído',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comentário excluído com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não tem permissão para excluir este comentário',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comentário não encontrado',
  })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<void> {
    return this.commentsService.remove(id, req.user);
  }
}
