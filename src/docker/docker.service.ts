import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Ambiente } from '../ambientes/entities/ambiente.entity';
import { LoggerService } from '../core/logger/logger.service';

@Injectable()
export class DockerService {
    public execAsync = promisify(exec);
    constructor(private readonly logger: LoggerService) {}

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

    async upAmbiente(ambiente: Ambiente) {
        return this.runAmbienteCommand(ambiente, 'comandoUp');
    }

    async downAmbiente(ambiente: Ambiente) {
        return this.runAmbienteCommand(ambiente, 'comandoDown');
    }

    async psAmbiente(ambiente: Ambiente) {
        return this.runAmbienteCommand(ambiente, 'docker compose ps');
    }
    
    private async runAmbienteCommand(ambiente: Ambiente, command: string | 'comandoUp' | 'comandoDown'): Promise<{ success: boolean; stdout: string; stderr: string; error?: string }> {
        try {
            const cmd = command === 'comandoUp' || command === 'comandoDown'
                ? ambiente[command]
                : command;
            const { stdout, stderr } = await this.execAsync(cmd, { cwd: ambiente.path });
            return { success: true, stdout, stderr };
        } catch (error) {
            this.logger.error(
                `Error ejecutando comando "${command}" en ambiente "${ambiente.nombre}" (ID: ${ambiente.id}): ${error.message}`,
                error.stack
            );
            return {
                success: false,
                stdout: error.stdout || '',
                stderr: error.stderr || '',
                error: error.message,
            };
        }
    }
}
