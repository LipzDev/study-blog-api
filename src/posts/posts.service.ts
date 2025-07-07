import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
    });
    return await this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findRecent(limit: number = 5): Promise<Post[]> {
    return await this.postRepository.find({
      order: { date: 'DESC' },
      take: limit,
    });
  }

  async findPaginated(
    page: number = 1,
    limit: number = 12,
    search?: string,
    startDate?: string,
    endDate?: string,
    authorId?: string,
  ): Promise<{ posts: Post[]; total: number }> {
    // Validação e sanitização de parâmetros
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), 100); // Máximo 100 itens

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author');

    // Filtro por autor (para usuários não-admin na rota /admin)
    if (authorId) {
      queryBuilder.andWhere('post.authorId = :authorId', { authorId });
    }

    // Filtro de busca corrigido - todas as palavras devem estar presentes
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchWords = searchTerm
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (searchWords.length > 0) {
        // Para cada palavra, deve existir em pelo menos um campo (título, conteúdo ou autor)
        searchWords.forEach((word, index) => {
          const paramKey = `search${index}`;
          const paramValue = `%${word.toLowerCase()}%`;

          // Cada palavra deve estar presente em pelo menos um dos campos
          queryBuilder.andWhere(
            `(LOWER(post.title) LIKE :${paramKey} OR LOWER(post.text) LIKE :${paramKey} OR LOWER(author.name) LIKE :${paramKey})`,
            { [paramKey]: paramValue },
          );
        });

        // Ordenação por relevância simplificada
        const titleMatches = searchWords
          .map((_, i) => `LOWER(post.title) LIKE :search${i}`)
          .join(' AND ');
        const authorMatches = searchWords
          .map((_, i) => `LOWER(author.name) LIKE :search${i}`)
          .join(' AND ');

        queryBuilder.addSelect(
          `CASE
            WHEN ${titleMatches} THEN 1
            WHEN ${authorMatches} THEN 2
            ELSE 3
          END`,
          'relevance',
        );
        queryBuilder.addOrderBy('relevance', 'ASC');
      }
    }

    // Validação adicional: verifica se data final é maior que data inicial
    if (
      startDate &&
      endDate &&
      this.isValidDate(startDate) &&
      this.isValidDate(endDate)
    ) {
      const startDateTime = new Date(startDate + 'T00:00:00.000Z');
      const endDateTime = new Date(endDate + 'T23:59:59.999Z');

      // Se data final for menor que inicial, ignora ambos os filtros
      if (endDateTime < startDateTime) {
        // Log para debug (opcional)
        console.warn(
          'Data final menor que data inicial. Ignorando filtros de data.',
        );
        // Não aplica nenhum filtro de data
      } else {
        // Aplica ambos os filtros se válidos
        queryBuilder.andWhere('post.date >= :startDate', {
          startDate: startDateTime,
        });
        queryBuilder.andWhere('post.date <= :endDate', {
          endDate: endDateTime,
        });
      }
    } else {
      // Filtro por data inicial apenas
      if (startDate && this.isValidDate(startDate)) {
        try {
          const startDateTime = new Date(startDate + 'T00:00:00.000Z');
          queryBuilder.andWhere('post.date >= :startDate', {
            startDate: startDateTime,
          });
        } catch (error) {
          // Ignora data inválida silenciosamente
        }
      }

      // Filtro por data final apenas
      if (endDate && this.isValidDate(endDate)) {
        try {
          const endDateTime = new Date(endDate + 'T23:59:59.999Z');
          queryBuilder.andWhere('post.date <= :endDate', {
            endDate: endDateTime,
          });
        } catch (error) {
          // Ignora data inválida silenciosamente
        }
      }
    }

    // Ordenação padrão por data (se não há busca por relevância)
    if (!search || !search.trim()) {
      queryBuilder.orderBy('post.date', 'DESC');
    } else {
      queryBuilder.addOrderBy('post.date', 'DESC');
    }

    // Paginação
    queryBuilder
      .skip((sanitizedPage - 1) * sanitizedLimit)
      .take(sanitizedLimit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return { posts, total };
  }

  // Método auxiliar para validar datas
  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async findBySlug(slug: string): Promise<any> {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }
    // Monta author seguro
    const safeAuthor = post.author
      ? {
          id: post.author.id,
          name: post.author.name,
          email: post.author.email,
          avatar: post.author.avatar,
          bio: post.author.bio,
          github: post.author.github,
          linkedin: post.author.linkedin,
          twitter: post.author.twitter,
          instagram: post.author.instagram,
          role: post.author.role,
          createdAt: post.author.createdAt,
          updatedAt: post.author.updatedAt,
        }
      : null;
    // Garante compatibilidade de image
    return {
      ...post,
      author: safeAuthor,
      createdAt: post.date,
      image: post.image || post.imagePath || null,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const post = await this.findOne(id);

    // Verificar permissões
    const canDelete = this.canUserDeletePost(user, post);
    if (!canDelete) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir esta postagem',
      );
    }

    await this.postRepository.remove(post);
    return { message: 'Postagem excluída com sucesso' };
  }

  /**
   * Verifica se o usuário pode excluir a postagem
   * - SUPER_ADMIN e ADMIN podem excluir qualquer postagem
   * - Usuários comuns só podem excluir suas próprias postagens
   */
  private canUserDeletePost(user: User, post: Post): boolean {
    // SUPER_ADMIN e ADMIN podem excluir qualquer postagem
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Usuário comum só pode excluir suas próprias postagens
    return user.id === post.authorId;
  }
}
