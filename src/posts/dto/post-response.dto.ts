import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostAuthorDto {
  @ApiProperty({
    description: 'ID único do autor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do autor',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do autor',
    example: 'joao.silva@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'Provedor de autenticação do usuário',
    example: 'local',
    enum: ['local', 'google'],
  })
  provider: string;

  @ApiPropertyOptional({
    description: 'ID do provedor de autenticação (se aplicável)',
    example: 'google_123456789',
  })
  providerId?: string;

  @ApiPropertyOptional({
    description: 'URL do avatar do autor',
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Biografia do autor',
    example: 'Desenvolvedor Full Stack apaixonado por tecnologia',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Link do perfil GitHub',
    example: 'https://github.com/joaosilva',
  })
  github?: string;

  @ApiPropertyOptional({
    description: 'Link do perfil LinkedIn',
    example: 'https://linkedin.com/in/joaosilva',
  })
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'Link do perfil Twitter',
    example: 'https://twitter.com/joaosilva',
  })
  twitter?: string;

  @ApiPropertyOptional({
    description: 'Link do perfil Instagram',
    example: 'https://instagram.com/joaosilva',
  })
  instagram?: string;

  @ApiProperty({
    description: 'Status de verificação do email',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Role/perfil do usuário no sistema',
    example: 'user',
    enum: ['user', 'admin', 'super_admin'],
  })
  role: string;

  @ApiProperty({
    description: 'Data de criação da conta',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização da conta',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class PostResponseDto {
  @ApiProperty({
    description: 'ID único da postagem',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Slug único da postagem (usado na URL)',
    example: 'minha-primeira-postagem',
  })
  slug: string;

  @ApiProperty({
    description: 'Título da postagem',
    example: 'Minha Primeira Postagem',
  })
  title: string;

  @ApiProperty({
    description: 'Conteúdo da postagem',
    example: 'Este é o conteúdo da minha primeira postagem...',
  })
  text: string;

  @ApiPropertyOptional({
    description: 'URL da imagem da postagem',
    example: 'https://example.com/image.jpg',
  })
  image?: string;

  @ApiPropertyOptional({
    description: 'Caminho do arquivo de imagem no servidor',
    example: 'image-123456.jpg',
  })
  imagePath?: string;

  @ApiProperty({
    description: 'Data de criação da postagem',
    example: '2024-01-15T10:30:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Data da última atualização da postagem',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Dados do autor da postagem',
    type: PostAuthorDto,
  })
  author: PostAuthorDto;

  @ApiPropertyOptional({
    description: 'Número de comentários na postagem',
    example: 5,
  })
  commentsCount?: number;
}

export class PostListResponseDto {
  @ApiProperty({
    description: 'Lista de postagens',
    type: [PostResponseDto],
  })
  posts: PostResponseDto[];

  @ApiProperty({
    description: 'Número total de postagens',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Número de postagens por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 5,
  })
  totalPages: number;
}
