import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'Empresa Sura', description: 'Nombre del cliente' })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}