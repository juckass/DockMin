import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAmbienteDto {
  @ApiProperty({ example: 1, description: 'ID del cliente asociado' })
  clienteId: number;

  @ApiProperty({ example: 'qa', description: 'Nombre del ambiente' })
  nombre: string;

  @ApiProperty({ example: '/proyectos/cliente/qa', description: 'Ruta absoluta al ambiente' })
  path: string;

  @ApiPropertyOptional({ example: 'cliente_qa', description: 'Prefijo de contenedores (opcional)' })
  prefijo?: string;

  @ApiProperty({ example: 'docker compose --profile=nginx up -d', description: 'Comando para levantar el ambiente' })
  comandoUp: string;

  @ApiProperty({ example: 'docker compose down', description: 'Comando para bajar el ambiente' })
  comandoDown: string;

  @ApiPropertyOptional({ example: ['nginx', 'php', 'mysql'], description: 'Perfiles de Docker (opcional)' })
  perfiles?: string[];

  @ApiPropertyOptional({ example: true, description: 'Levantar automáticamente al reinicio (opcional)' })
  autostart?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Orden en la UI o listados (opcional)' })
  orden?: number;
}