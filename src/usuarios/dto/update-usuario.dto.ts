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

  @ApiProperty({
    example: 'some-refresh-token',
    description: 'Token de actualización del usuario',
    required: false,
  })
  @IsOptional()
  refreshToken?: string | null;

  @ApiProperty({
    example: '2023-12-31T23:59:59.999Z',
    description: 'Fecha de expiración del token de actualización',
    required: false,
  })
  @IsOptional()
  refreshTokenExpires?: Date | null;
}
