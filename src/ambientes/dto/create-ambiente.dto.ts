import { IsInt, IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAmbienteDto {
  @ApiProperty({ example: 1, description: 'ID del cliente asociado' })
  @IsInt()
  clienteId: number;

  @ApiProperty({ example: 'qa', description: 'Nombre del ambiente' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: '/proyectos/sura/qa', description: 'Ruta absoluta al ambiente' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiPropertyOptional({ example: 'sura_qa', description: 'Prefijo de contenedores (opcional)' })
  @IsString()
  @IsOptional()
  prefijo?: string;

  @ApiProperty({ example: 'docker compose --profile=nginx up -d', description: 'Comando para levantar el ambiente' })
  @IsString()
  @IsNotEmpty()
  comandoUp: string;

  @ApiProperty({ example: 'docker compose --profile=nginx down', description: 'Comando para bajar el ambiente' })
  @IsString()
  @IsNotEmpty()
  comandoDown: string;

  @ApiPropertyOptional({ example: ['nginx', 'php', 'mysql'], description: 'Perfiles de Docker (opcional)' })
  @IsArray()
  @IsOptional()
  perfiles?: string[];

  @ApiPropertyOptional({ example: true, description: 'Levantar automáticamente al reinicio (opcional)' })
  @IsBoolean()
  @IsOptional()
  autostart?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Orden en la UI o listados (opcional)' })
  @IsInt()
  @IsOptional()
  orden?: number;
}