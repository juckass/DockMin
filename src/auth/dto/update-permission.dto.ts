

import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar un permiso existente.
 *
 * Ejemplo de uso:
 * {
 *   "nombre": "crear_cliente",
 *   "descripcion": "Permite crear clientes"
 * }
 */
export class UpdatePermissionDto {
  @ApiPropertyOptional({
    example: 'crear_cliente',
    description: 'Nuevo nombre único del permiso (opcional). Usar snake_case.'
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Permite crear clientes',
    description: 'Nueva descripción del permiso (opcional).'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}