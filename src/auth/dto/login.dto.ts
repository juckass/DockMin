

import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para login de usuario.
 *
 * Ejemplo de uso:
 * {
 *   "email": "admin@dockmin.com",
 *   "password": "admin123"
 * }
 */
export class LoginDto {
  @ApiProperty({
    example: 'admin@dockmin.com',
    description: 'Email válido del usuario registrado.'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Contraseña del usuario (mínimo 6 caracteres).'
  })
  @IsString()
  password: string;
}