import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    postId: string,
    user: User,
  ): Promise<CommentResponseDto> {
    // Verificar se o post existe
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      authorId: user.id,
      postId,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Buscar o comentário com a relação do autor carregada
    const commentWithAuthor = await this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    });

    if (!commentWithAuthor) {
      throw new Error('Erro ao carregar comentário criado');
    }

    return this.mapToResponseDto(commentWithAuthor);
  }

  async findAllByPost(postId: string): Promise<CommentResponseDto[]> {
    const comments = await this.commentsRepository.find({
      where: { postId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });

    return comments.map((comment) => this.mapToResponseDto(comment));
  }

  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    return this.mapToResponseDto(comment);
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Verificar se o usuário é o autor do comentário
    if (comment.authorId !== user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este comentário',
      );
    }

    Object.assign(comment, updateCommentDto);
    const updatedComment = await this.commentsRepository.save(comment);
    return this.mapToResponseDto(updatedComment);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Verificar se o usuário é o autor do comentário
    if (comment.authorId !== user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este comentário',
      );
    }

    await this.commentsRepository.remove(comment);
  }

  private mapToResponseDto(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        email: comment.author.email,
        avatar: comment.author.avatar,
        bio: comment.author.bio,
        github: comment.author.github,
        linkedin: comment.author.linkedin,
        twitter: comment.author.twitter,
        instagram: comment.author.instagram,
      },
    };
  }
}
