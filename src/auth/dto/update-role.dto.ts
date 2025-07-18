

import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar un rol existente.
 *
 * Ejemplo de uso:
 * {
 *   "nombre": "admin",
 *   "permisos": [1, 2]
 * }
 */
export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'admin',
    description: 'Nuevo nombre único del rol (opcional). Usar minúsculas.'
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2],
    description: 'Nuevos IDs numéricos de los permisos a asignar al rol (opcional).'
  })
  @IsOptional()
  @IsArray()
  permisos?: number[];
}