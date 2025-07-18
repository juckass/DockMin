

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la creación de un permiso.
 *
 * Ejemplo de uso:
 * {
 *   "nombre": "crear_cliente",
 *   "descripcion": "Permite crear clientes"
 * }
 */
export class CreatePermissionDto {
  @ApiProperty({
    example: 'crear_cliente',
    description: 'Nombre único y representativo del permiso. Usar snake_case.'
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'Permite crear clientes',
    required: false,
    description: 'Descripción legible del permiso (opcional)'
  })
  @IsString()
  descripcion?: string;
}