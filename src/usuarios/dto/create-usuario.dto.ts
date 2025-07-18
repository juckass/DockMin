import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Test User',
    description: 'Nombre completo del usuario',
  })
  @IsNotEmpty()
  nombreCompleto: string;

  @ApiProperty({
    example: 'password123',
    description: 'password del usuario (mínimo 6 caracteres)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 1,
    description: 'ID del rol asignado al usuario',
    required: true,
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  roleId: number;
}
