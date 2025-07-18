import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO para la creación de un usuario.
 *
 * Ejemplo de uso:
 * {
 *   "email": "test@example.com",
 *   "nombreCompleto": "Test User",
 *   "password": "password123",
 *   "roleId": 1
 * }
 */
export class CreateUsuarioDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'Correo electrónico único y válido del usuario.'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Test User',
    description: 'Nombre completo del usuario.'
  })
  @IsNotEmpty()
  nombreCompleto: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres).'
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 1,
    description: 'ID numérico del rol asignado al usuario. Debe existir previamente.',
    required: true
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  roleId: number;
}
