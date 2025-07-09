import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false, description: 'Nome do usuário' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false, description: 'Biografia do usuário' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    required: false,
    description: 'URL do GitHub',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf(
    (o) => o.github !== undefined && o.github !== null && o.github !== '',
  )
  @IsUrl({}, { message: 'GitHub deve ser uma URL válida' })
  @MaxLength(255)
  github?: string | null;

  @ApiProperty({
    required: false,
    description: 'URL do LinkedIn',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf(
    (o) => o.linkedin !== undefined && o.linkedin !== null && o.linkedin !== '',
  )
  @IsUrl({}, { message: 'LinkedIn deve ser uma URL válida' })
  @MaxLength(255)
  linkedin?: string | null;

  @ApiProperty({
    required: false,
    description: 'URL do Twitter',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf(
    (o) => o.twitter !== undefined && o.twitter !== null && o.twitter !== '',
  )
  @IsUrl({}, { message: 'Twitter deve ser uma URL válida' })
  @MaxLength(255)
  twitter?: string | null;

  @ApiProperty({
    required: false,
    description: 'URL do Instagram',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf(
    (o) =>
      o.instagram !== undefined && o.instagram !== null && o.instagram !== '',
  )
  @IsUrl({}, { message: 'Instagram deve ser uma URL válida' })
  @MaxLength(255)
  instagram?: string | null;
}
