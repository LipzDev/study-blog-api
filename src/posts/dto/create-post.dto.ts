import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Slug único da postagem (usado na URL)',
    example: 'minha-primeira-postagem',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Título da postagem',
    example: 'Minha Primeira Postagem',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'URL da imagem da postagem',
    example: 'https://example.com/image.jpg',
    type: String,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Caminho do arquivo de imagem no servidor',
    example: 'image-123456.jpg',
    type: String,
  })
  @IsOptional()
  @IsString()
  imagePath?: string;

  @ApiProperty({
    description: 'Conteúdo da postagem (mínimo 50 caracteres)',
    example:
      'Este é o conteúdo da minha primeira postagem. Deve ter pelo menos 50 caracteres para ser válido.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  // authorId será adicionado automaticamente pelo controller via JWT
  @ApiPropertyOptional({
    description: 'ID do autor (preenchido automaticamente pelo sistema)',
    example: '456e7890-e89b-12d3-a456-426614174001',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;
}
