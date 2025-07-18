import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Ambiente } from '../ambientes/entities/ambiente.entity';
import { LoggerService } from '../core/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { parseTableOutput } from '../core/utils/parse-table-output';
import { DockerCommandResultDto } from './dto/docker-command-result.dto';

@Injectable()
export class DockerService {
    public execAsync = promisify(exec);
    constructor(
        private readonly logger: LoggerService,
        private readonly configService: ConfigService,
    ) {}

    async isDockerRunning(): Promise<boolean> {
        try {
            await this.execAsync('docker info');
            return true;
        } catch (error) {
            return false;
        }
    }

    async hasDockerPermissions(): Promise<boolean> {
        try {
            await this.execAsync('docker ps');
            return true;
        } catch (error) {
            if (error.stderr && error.stderr.includes('permission denied')) {
                return false;
            }
            return false;
        }
    }
    async getDockerVersion(): Promise<string | null> {
        try {
            const { stdout } = await this.execAsync('docker --version');
            // Ejemplo de salida: Docker version 24.0.2, build cb74dfc
            return stdout.split('\n')[0];
        } catch {
            return null;
        }
    }

    async upAmbiente(ambiente: Ambiente): Promise<DockerCommandResultDto & { parsed: any }> {
        const result = await this.runAmbienteCommand(ambiente, 'comandoUp');
        const dto = new DockerCommandResultDto();
        dto.success = result.success;
        dto.stdout = result.stdout;
        dto.stderr = result.stderr;
        dto.error = result.error;
        dto.errorType = result.errorType;
        return {
            ...dto,
            parsed: parseTableOutput(result.stdout)
        };
    }

    async downAmbiente(ambiente: Ambiente): Promise<DockerCommandResultDto & { parsed: any }> {
        const result = await this.runAmbienteCommand(ambiente, 'comandoDown');
        const dto = new DockerCommandResultDto();
        dto.success = result.success;
        dto.stdout = result.stdout;
        dto.stderr = result.stderr;
        dto.error = result.error;
        dto.errorType = result.errorType;
        return {
            ...dto,
            parsed: parseTableOutput(result.stdout)
        };
    }

    async psAmbiente(ambiente: Ambiente): Promise<DockerCommandResultDto & { parsed: any }> {
        const result = await this.runAmbienteCommand(ambiente, 'docker compose ps');
        const dto = new DockerCommandResultDto();
        dto.success = result.success;
        dto.stdout = result.stdout;
        dto.stderr = result.stderr;
        dto.error = result.error;
        dto.errorType = result.errorType;
        return {
            ...dto,
            parsed: parseTableOutput(result.stdout)
        };
    }
    
    private isPathSafe(basePath: string, ambientePath: string): boolean {
        return ambientePath.startsWith(path.resolve(basePath));
    }

    private detectDockerErrorType(error: any): { errorType: string, errorMsg: string } {
        if (error.stderr && error.stderr.includes('permission denied')) {
            return { errorType: 'PERMISSION', errorMsg: 'Permisos insuficientes para ejecutar Docker.' };
        }
        if (error.stderr && error.stderr.includes('Cannot connect to the Docker daemon')) {
            return { errorType: 'DOCKER_NOT_RUNNING', errorMsg: 'Docker no está corriendo o no es accesible.' };
        }
        if (error.stderr && (error.stderr.includes('No such container') || error.stderr.includes('No such service'))) {
            return { errorType: 'COMMAND', errorMsg: 'El contenedor o servicio especificado no existe.' };
        }
        return { errorType: 'UNKNOWN', errorMsg: error.message || 'Error desconocido' };
    }

    private getAmbienteCommand(ambiente: Ambiente, command: string | 'comandoUp' | 'comandoDown'): string {
        return command === 'comandoUp' || command === 'comandoDown'
            ? ambiente[command]
            : command;
    }

    private validateAmbientePath(basePath: string, ambientePath: string, ambiente: Ambiente): string | null {
        if (!this.isPathSafe(basePath, ambientePath)) {
            const errorMsg = 'Ruta de ambiente fuera del directorio permitido';
            this.logger.error(
                `Error de validación en ambiente "${ambiente.nombre}" (ID: ${ambiente.id}): ${errorMsg}`
            );
            return errorMsg;
        }
        return null;
    }

    private handleCommandError(error: any, command: string, ambiente: Ambiente): DockerCommandResultDto {
        const { errorType, errorMsg } = this.detectDockerErrorType(error);
        this.logger.error(
            `Error ejecutando comando "${command}" en ambiente "${ambiente.nombre}" (ID: ${ambiente.id}): ${errorMsg}`,
            error.stack
        );
        const dto = new DockerCommandResultDto();
        dto.success = false;
        dto.stdout = error.stdout || '';
        dto.stderr = error.stderr || '';
        dto.error = errorMsg;
        dto.errorType = errorType as any;
        return dto;
    }

    /**
     * Valida que el comando sea seguro y permitido.
     * Solo permite comandos docker compose up/down/ps con argumentos simples.
     * Rechaza operadores peligrosos y comandos arbitrarios.
     */
    private isCommandSafe(cmd: string): boolean {
        // Solo permite docker compose up/down/ps (con o sin --profile, -d, etc)
        const allowed = [
            /^docker compose( --profile=[\w-]+)? up( -d)?$/,
            /^docker compose( --profile=[\w-]+)? down( -d)?$/,
            /^docker compose ps$/
        ];
        // Rechaza operadores peligrosos
        const forbidden = /[;&|><`$]/;
        if (forbidden.test(cmd)) return false;
        return allowed.some((re) => re.test(cmd.trim()));
    }

    private async runAmbienteCommand(
        ambiente: Ambiente,
        command: string | 'comandoUp' | 'comandoDown'
    ): Promise<DockerCommandResultDto> {
        const cmd = this.getAmbienteCommand(ambiente, command);
        const basePath = this.configService.get<string>('AMBIENTES_BASE_PATH') || '';
        const ambientePath = path.resolve(basePath, ambiente.path.replace(basePath, ''));
        const errorMsg = this.validateAmbientePath(basePath, ambientePath, ambiente);
        if (errorMsg) {
            const dto = new DockerCommandResultDto();
            dto.success = false;
            dto.stdout = '';
            dto.stderr = '';
            dto.error = errorMsg;
            dto.errorType = 'VALIDATION';
            return dto;
        }
        if (!this.isCommandSafe(cmd)) {
            const dto = new DockerCommandResultDto();
            dto.success = false;
            dto.stdout = '';
            dto.stderr = '';
            dto.error = 'Comando Docker no permitido o potencialmente peligroso.';
            dto.errorType = 'VALIDATION';
            this.logger.error(
                `Intento de comando no permitido en ambiente "${ambiente.nombre}" (ID: ${ambiente.id}): ${cmd}`
            );
            return dto;
        }
        try {
            const { stdout, stderr } = await this.execAsync(cmd, { cwd: ambientePath });
            const dto = new DockerCommandResultDto();
            dto.success = true;
            dto.stdout = stdout;
            dto.stderr = stderr;
            return dto;
        } catch (error) {
            return this.handleCommandError(error, command, ambiente);
        }
    }
}
