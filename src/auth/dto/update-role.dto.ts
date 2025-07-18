
import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'admin', description: 'Nombre del rol' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ type: [Number], example: [1,2], description: 'IDs de permisos a asignar' })
  @IsOptional()
  @IsArray()
  permisos?: number[]; // IDs de permisos
}