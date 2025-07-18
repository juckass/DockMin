
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'crear_cliente', description: 'Nombre único del permiso' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Permite crear clientes', description: 'Descripción del permiso' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}