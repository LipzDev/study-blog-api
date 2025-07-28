import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'URL do avatar do usuário',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'Biografia do usuário',
    example: 'Desenvolvedor Full Stack apaixonado por tecnologia',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'Link do perfil GitHub',
    example: 'https://github.com/joaosilva',
    required: false,
  })
  github?: string;

  @ApiProperty({
    description: 'Link do perfil LinkedIn',
    example: 'https://linkedin.com/in/joaosilva',
    required: false,
  })
  linkedin?: string;

  @ApiProperty({
    description: 'Link do perfil Twitter',
    example: 'https://twitter.com/joaosilva',
    required: false,
  })
  twitter?: string;

  @ApiProperty({
    description: 'Link do perfil Instagram',
    example: 'https://instagram.com/joaosilva',
    required: false,
  })
  instagram?: string;

  @ApiProperty({
    description: 'Status de verificação do email',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Role do usuário',
    enum: ['user', 'admin', 'super_admin'],
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'Data de criação da conta',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Dados do usuário logado',
    type: UserProfileDto,
  })
  user: UserProfileDto;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example:
      'Usuário registrado com sucesso. Verifique seu email para confirmar a conta.',
  })
  message: string;

  @ApiProperty({
    description: 'Dados do usuário registrado',
    type: UserProfileDto,
  })
  user: UserProfileDto;
}
