import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateAmbienteDto {
  @ApiProperty({ example: 1, description: 'ID del cliente' })
  @IsNumber({}, { message: 'El clienteId debe ser un número.' })
  clienteId: number;

  @ApiProperty({ example: 'qa', description: 'Nombre del ambiente' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  nombre: string;

  @ApiProperty({ example: '/proyectos/demo/qa', description: 'Ruta del ambiente' })
  @IsString({ message: 'El path debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El path es obligatorio.' })
  path: string;

  @ApiProperty({ example: 'demo_qa', description: 'Prefijo del ambiente', required: false })
  @IsString({ message: 'El prefijo debe ser una cadena de texto.' })
  @IsOptional()
  prefijo?: string;

  @ApiProperty({ example: 'docker compose up -d', description: 'Comando para levantar el ambiente' })
  @IsString({ message: 'El comandoUp debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El comandoUp es obligatorio.' })
  comandoUp: string;

  @ApiProperty({ example: 'docker compose down', description: 'Comando para bajar el ambiente' })
  @IsString({ message: 'El comandoDown debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El comandoDown es obligatorio.' })
  comandoDown: string;

  @ApiProperty({ example: ['nginx', 'php'], description: 'Perfiles de Docker', required: false })
  @IsArray({ message: 'Perfiles debe ser un arreglo.' })
  @IsOptional()
  perfiles?: string[];

  @ApiProperty({ example: true, description: 'Autostart', required: false })
  @IsBoolean({ message: 'Autostart debe ser booleano.' })
  @IsOptional()
  autostart?: boolean;

  @ApiProperty({ example: 1, description: 'Orden', required: false })
  @IsNumber({}, { message: 'El orden debe ser un número.' })
  @IsOptional()
  orden?: number;
}