import { getSchemaPath } from '@nestjs/swagger';
import { DockerCommandResultDto } from '../dto/docker-command-result.dto';

export const dockerUpResponseDoc = {
    status: 200,
    description: 'Resultado de la ejecución',
    schema: {
        allOf: [
            { $ref: getSchemaPath(DockerCommandResultDto) },
            {
                properties: {
                    parsed: {
                        type: 'object',
                        description: 'Salida parseada en JSON si aplica (por ejemplo, para docker compose ps).',
                        example: [{ Nombre: 'web_1', Estado: 'running', Puertos: '80/tcp' }]
                    }
                }
            }
        ]
    },
    examples: {
        success: {
            summary: 'Comando ejecutado correctamente',
            value: {
                success: true,
                stdout: 'Nombre   Estado   Puertos\nweb_1   running   80/tcp',
                stderr: '',
                parsed: [{ Nombre: 'web_1', Estado: 'running', Puertos: '80/tcp' }]
            }
        },
        error: {
            summary: 'Error de validación',
            value: {
                success: false,
                stdout: '',
                stderr: '',
                error: 'Ruta de ambiente fuera del directorio permitido',
                errorType: 'VALIDATION',
                parsed: []
            }
        }
    }
};

export const dockerDownResponseDoc = {
    status: 200,
    description: 'Resultado de la ejecución',
    schema: {
        allOf: [
            { $ref: getSchemaPath(DockerCommandResultDto) },
            {
                properties: {
                    parsed: {
                        type: 'object',
                        description: 'Salida parseada en JSON si aplica (por ejemplo, para docker compose ps).',
                        example: []
                    }
                }
            }
        ]
    },
    examples: {
        success: {
            summary: 'Comando ejecutado correctamente',
            value: {
                success: true,
                stdout: 'Salida estándar del comando',
                stderr: '',
                parsed: []
            }
        },
        error: {
            summary: 'Error de validación',
            value: {
                success: false,
                stdout: '',
                stderr: '',
                error: 'Ruta de ambiente fuera del directorio permitido',
                errorType: 'VALIDATION',
                parsed: []
            }
        }
    }
};

export const dockerPsResponseDoc = {
    status: 200,
    description: 'Resultado de la ejecución',
    schema: {
        allOf: [
            { $ref: getSchemaPath(DockerCommandResultDto) },
            {
                properties: {
                    parsed: {
                        type: 'object',
                        description: 'Salida parseada en JSON si aplica (por ejemplo, para docker compose ps).',
                        example: [{ Nombre: 'web_1', Estado: 'running', Puertos: '80/tcp' }]
                    }
                }
            }
        ]
    },
    examples: {
        success: {
            summary: 'Comando ejecutado correctamente',
            value: {
                success: true,
                stdout: 'Nombre   Estado   Puertos\nweb_1   running   80/tcp',
                stderr: '',
                parsed: [{ Nombre: 'web_1', Estado: 'running', Puertos: '80/tcp' }]
            }
        },
        error: {
            summary: 'Error de validación',
            value: {
                success: false,
                stdout: '',
                stderr: '',
                error: 'Ruta de ambiente fuera del directorio permitido',
                errorType: 'VALIDATION',
                parsed: []
            }
        }
    }
};
