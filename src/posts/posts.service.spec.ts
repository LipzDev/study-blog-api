import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsService', () => {
  let service: PostsService;
  let repository: Repository<Post>;

  // Testes focados apenas nos métodos utilizados pelo frontend:
  // - create: Criação de posts
  // - findPaginated: Listagem paginada (substitui findAll e findRecent)
  // - findBySlug: Visualização individual de posts
  // - update: Edição de posts
  // - remove: Remoção de posts

  const mockPost: Post = {
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
      role: 'user' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      posts: [],
    },
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<Repository<Post>>(getRepositoryToken(Post));
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

      mockRepository.create.mockReturnValue(mockPost);
      mockRepository.save.mockResolvedValue(mockPost);

      const result = await service.create(createPostDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createPostDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockPost);
      expect(result).toEqual(mockPost);
    });
  });

  // Métodos findAll e findRecent removidos - não utilizados no frontend
  // Frontend usa apenas getPaginatedPosts para todas as necessidades

  describe('findPaginated', () => {
    it('should return paginated posts with default values', async () => {
      const posts = [mockPost];
      const total = 1;
      mockRepository.findAndCount.mockResolvedValue([posts, total]);

      const result = await service.findPaginated();

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        order: { date: 'DESC' },
        skip: 0,
        take: 12,
      });
      expect(result).toEqual({ posts, total });
    });

    it('should return paginated posts with custom values', async () => {
      const posts = [mockPost];
      const total = 1;
      mockRepository.findAndCount.mockResolvedValue([posts, total]);

      const result = await service.findPaginated(2, 5);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        order: { date: 'DESC' },
        skip: 5,
        take: 5,
      });
      expect(result).toEqual({ posts, total });
    });
  });

  // Método findOne removido - frontend usa apenas findBySlug para visualização individual

  describe('findBySlug', () => {
    it('should return a post by slug', async () => {
      mockRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findBySlug(mockPost.slug);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: mockPost.slug },
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found by slug', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(
        'Post with slug non-existent-slug not found',
      );
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        text: 'Updated content',
      };

      const updatedPost = { ...mockPost, ...updatePostDto };

      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.save.mockResolvedValue(updatedPost);

      const result = await service.update(mockPost.id, updatePostDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPost.id },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockPost,
        ...updatePostDto,
      });
      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException when updating non-existent post', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const mockAdminUser = {
      id: 'admin-id',
      role: 'admin',
    } as any;

    const mockRegularUser = {
      id: 'user-id',
      role: 'user',
    } as any;

    it('should allow admin to remove any post', async () => {
      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.remove.mockResolvedValue(mockPost);

      const result = await service.remove(mockPost.id, mockAdminUser);

      expect(result).toEqual({ message: 'Postagem excluída com sucesso' });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPost.id },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockPost);
    });

    it('should allow user to remove their own post', async () => {
      const userPost = { ...mockPost, authorId: 'user-id' };
      mockRepository.findOne.mockResolvedValue(userPost);
      mockRepository.remove.mockResolvedValue(userPost);

      const result = await service.remove(userPost.id, mockRegularUser);

      expect(result).toEqual({ message: 'Postagem excluída com sucesso' });
      expect(mockRepository.remove).toHaveBeenCalledWith(userPost);
    });

    it('should not allow user to remove other users post', async () => {
      const otherUserPost = { ...mockPost, authorId: 'other-user-id' };
      mockRepository.findOne.mockResolvedValue(otherUserPost);

      await expect(
        service.remove(otherUserPost.id, mockRegularUser),
      ).rejects.toThrow('Você não tem permissão para excluir esta postagem');
    });

    it('should throw NotFoundException when removing non-existent post', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('non-existent-id', mockAdminUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
