import { IsString, IsArray } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  nombre: string;

  @IsArray()
  permisos: number[]; // IDs de permisos
}