
import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: 'Nombre del rol' })
  @IsString()
  nombre: string;

  @ApiProperty({ type: [Number], example: [1,2], description: 'IDs de permisos a asignar' })
  @IsArray()
  permisos: number[]; // IDs de permisos
}