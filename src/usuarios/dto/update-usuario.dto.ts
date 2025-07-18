import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, MinLength } from 'class-validator';

/**
 * DTO para la actualización parcial de un usuario.
 *
 * Ejemplo de uso:
 * {
 *   "email": "nuevo@email.com",
 *   "nombreCompleto": "Nuevo Nombre",
 *   "password": "nuevopass123",
 *   "refreshToken": null,
 *   "refreshTokenExpires": null
 * }
 */
export class UpdateUsuarioDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'Nuevo correo electrónico del usuario (opcional).',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'Updated User',
    description: 'Nuevo nombre completo del usuario (opcional).',
    required: false
  })
  @IsOptional()
  nombreCompleto?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Nueva contraseña del usuario (mínimo 6 caracteres, opcional).',
    required: false
  })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    example: 'some-refresh-token',
    description: 'Nuevo refresh token del usuario (opcional, para uso interno).',
    required: false
  })
  @IsOptional()
  refreshToken?: string | null;

  @ApiProperty({
    example: '2023-12-31T23:59:59.999Z',
    description: 'Nueva fecha de expiración del refresh token (opcional, para uso interno).',
    required: false
  })
  @IsOptional()
  refreshTokenExpires?: Date | null;
  @ApiProperty({
    example: 2,
    description: 'Nuevo ID de rol a asignar al usuario (opcional).',
    required: false
  })
  @IsOptional()
  roleId?: number;
}
