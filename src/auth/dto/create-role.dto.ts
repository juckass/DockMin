

import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la creación de un rol.
 *
 * Ejemplo de uso:
 * {
 *   "nombre": "admin",
 *   "permisos": [1, 2]
 * }
 */
export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nombre único y representativo del rol. Usar minúsculas.'
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    type: [Number],
    example: [1, 2],
    description: 'IDs numéricos de los permisos a asignar al rol.'
  })
  @IsArray()
  permisos: number[];
}