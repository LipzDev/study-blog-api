import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Endereço de email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'Forneça um endereço de email válido' })
  @IsNotEmpty()
  email: string;
}
