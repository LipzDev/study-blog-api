import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Slug único da postagem (usado na URL)',
    example: 'minha-primeira-postagem',
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Título da postagem',
    example: 'Minha Primeira Postagem',
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

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

  @ApiPropertyOptional({
    description: 'Conteúdo da postagem',
    example: 'Este é o conteúdo atualizado da postagem.',
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  text?: string;

  // authorId NÃO é permitido em updates - o autor não pode ser alterado
}
