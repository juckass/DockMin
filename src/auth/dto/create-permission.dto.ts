
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'crear_cliente', description: 'Nombre único del permiso' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Permite crear clientes', required: false, description: 'Descripción del permiso' })
  @IsString()
  descripcion?: string;
}