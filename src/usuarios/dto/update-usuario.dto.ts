import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'Correo electrónico del usuario',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'Updated User',
    description: 'Nombre completo del usuario',
    required: false,
  })
  @IsOptional()
  nombreCompleto?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Nueva password del usuario (mínimo 6 caracteres)',
    required: false,
  })
  @IsOptional()
  @MinLength(6)
  password?: string;
}
