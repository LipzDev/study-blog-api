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
import { User, UserRole, UserProvider } from '../users/entities/user.entity';

export type PublicAuthor = {
  id: string;
  email: string;
  name: string;
  provider: UserProvider;
  providerId?: string;
  avatar?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicPost = Omit<Post, 'author'> & { author: PublicAuthor | null };

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

  // Função utilitária para remover campos sensíveis do usuário
  private removeSensitiveUserFields(user: User): PublicAuthor {
    // Remover campos sensíveis sem declarar variáveis não usadas
    const {
      password,
      emailVerificationToken,
      resetPasswordToken,
      resetPasswordExpires,
      posts,
      ...safeUser
    } = user;
    void password;
    void emailVerificationToken;
    void resetPasswordToken;
    void resetPasswordExpires;
    void posts;
    return safeUser as PublicAuthor;
  }

  async findPaginated(
    page: number = 1,
    limit: number = 12,
    search?: string,
    startDate?: string,
    endDate?: string,
    authorId?: string,
  ): Promise<{ posts: PublicPost[]; total: number }> {
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
        } catch {
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
        } catch {
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

    const safePosts: PublicPost[] = posts.map((post) => {
      if (!post.author) return { ...post, author: null };
      return {
        ...post,
        author: this.removeSensitiveUserFields(post.author),
      };
    });

    return { posts: safePosts, total };
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

  async findBySlug(slug: string): Promise<PublicPost> {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }
    let safeAuthor: PublicAuthor | null = null;
    if (post.author) {
      safeAuthor = this.removeSensitiveUserFields(post.author);
    }
    return {
      ...post,
      author: safeAuthor,
      image: post.image || post.imagePath || '',
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
   * Verifica se o usuário pode excluir/editar a postagem
   * - SUPER_ADMIN pode tudo
   * - ADMIN pode posts de USER e ADMIN, mas nunca de SUPER_ADMIN
   * - USER só pode o próprio post
   */
  private canUserDeletePost(user: User, post: Post): boolean {
    if (user.role === UserRole.SUPER_ADMIN) {
      return true; // superadmin pode tudo
    }
    if (user.role === UserRole.ADMIN) {
      // admin pode excluir/editar posts de user comum e de admin, mas nunca de superadmin
      if (post.author && post.author.role) {
        return post.author.role !== UserRole.SUPER_ADMIN;
      }
      // fallback: se não tem author carregado, não permite
      return false;
    }
    // user só pode excluir/editar o próprio post
    return user.id === post.authorId;
  }
}
