import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  // Testes focados apenas nos endpoints utilizados pelo frontend:
  // - POST /posts: Criação de posts (com autenticação)
  // - GET /posts/paginated: Listagem paginada
  // - GET /posts/slug/:slug: Visualização por slug
  // - PATCH /posts/:id: Edição de posts
  // - DELETE /posts/:id: Remoção de posts

  const mockPost = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    slug: 'test-post',
    title: 'Test Post',
    text: 'This is a test post content',
    image: 'https://example.com/image.jpg',
    imagePath: 'image.jpg',
    date: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    authorId: '456e7890-e89b-12d3-a456-426614174001',
    author: {
      id: '456e7890-e89b-12d3-a456-426614174001',
      email: 'test@example.com',
      name: 'Test User',
      provider: 'local' as any,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      posts: [],
    },
  };

  const mockPostsService = {
    create: jest.fn(),
    findPaginated: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    // Métodos removidos: findAll, findRecent, findOne (não utilizados no frontend)
  };

  const mockRequest = {
    user: {
      id: '456e7890-e89b-12d3-a456-426614174001',
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto: CreatePostDto = {
        slug: 'test-post',
        title: 'Test Post',
        text: 'This is a test post content',
        image: 'https://example.com/image.jpg',
        imagePath: 'image.jpg',
        authorId: '456e7890-e89b-12d3-a456-426614174001',
      };

      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create(createPostDto, mockRequest);

      expect(mockPostsService.create).toHaveBeenCalledWith({
        ...createPostDto,
        authorId: mockRequest.user.id,
      });
      expect(result).toEqual(mockPost);
    });
  });

  // Testes removidos: findAll e findRecent não são utilizados no frontend

  describe('findPaginated', () => {
    it('should return paginated posts with default values', async () => {
      const paginatedResult = { posts: [mockPost], total: 1 };
      mockPostsService.findPaginated.mockResolvedValue(paginatedResult);

      const result = await controller.findPaginated(1, 12);

      expect(mockPostsService.findPaginated).toHaveBeenCalledWith(1, 12);
      expect(result).toEqual(paginatedResult);
    });

    it('should return paginated posts with custom values', async () => {
      const paginatedResult = { posts: [mockPost], total: 1 };
      mockPostsService.findPaginated.mockResolvedValue(paginatedResult);

      const result = await controller.findPaginated(2, 5);

      expect(mockPostsService.findPaginated).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findBySlug', () => {
    it('should return a post by slug', async () => {
      mockPostsService.findBySlug.mockResolvedValue(mockPost);

      const result = await controller.findBySlug('test-post');

      expect(mockPostsService.findBySlug).toHaveBeenCalledWith('test-post');
      expect(result).toEqual(mockPost);
    });
  });

  // Teste removido: findOne não é utilizado no frontend (apenas findBySlug)

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        text: 'Updated content',
      };

      const updatedPost = { ...mockPost, ...updatePostDto };
      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await controller.update(mockPost.id, updatePostDto);

      expect(mockPostsService.update).toHaveBeenCalledWith(
        mockPost.id,
        updatePostDto,
      );
      expect(result).toEqual(updatedPost);
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      mockPostsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockPost.id);

      expect(mockPostsService.remove).toHaveBeenCalledWith(mockPost.id);
    });
  });
});
