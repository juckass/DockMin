import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Tipos de error posibles al ejecutar un comando Docker.
 * - PERMISSION: El usuario no tiene permisos para ejecutar Docker.
 * - DOCKER_NOT_RUNNING: Docker no está corriendo o no es accesible.
 * - VALIDATION: Error de validación en los parámetros o path.
 * - COMMAND: El contenedor o servicio especificado no existe.
 * - UNKNOWN: Otro error no clasificado.
 */
export type DockerCommandErrorType = 'PERMISSION' | 'DOCKER_NOT_RUNNING' | 'VALIDATION' | 'COMMAND' | 'UNKNOWN';

/**
 * Resultado estándar de la ejecución de un comando Docker en el servicio.
 *
 * @property success Indica si el comando se ejecutó correctamente.
 * @property stdout Salida estándar del comando.
 * @property stderr Salida de error del comando.
 * @property error Mensaje de error amigable (si aplica).
 * @property errorType Tipo de error detectado (si aplica).
 */
export class DockerCommandResultDto {
  @ApiProperty({ description: 'Indica si el comando se ejecutó correctamente.' })
  success: boolean;

  @ApiProperty({ description: 'Salida estándar del comando.' })
  stdout: string;

  @ApiProperty({ description: 'Salida de error del comando.' })
  stderr: string;

  @ApiPropertyOptional({ description: 'Mensaje de error amigable (si aplica).' })
  error?: string;

  @ApiPropertyOptional({
    description: 'Tipo de error detectado (si aplica).',
    enum: ['PERMISSION', 'DOCKER_NOT_RUNNING', 'VALIDATION', 'COMMAND', 'UNKNOWN'],
  })
  errorType?: DockerCommandErrorType;
}