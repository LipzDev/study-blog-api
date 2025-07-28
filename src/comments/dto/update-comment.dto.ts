import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty({
    description: 'Conteúdo do comentário (opcional para atualização)',
    example: 'Conteúdo atualizado do comentário',
    required: false,
    minLength: 1,
    maxLength: 1000,
  })
  content?: string;
}
