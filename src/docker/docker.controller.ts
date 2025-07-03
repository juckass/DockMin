import { Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { DockerService } from './docker.service';
import { AmbientesService } from '../ambientes/ambientes.service';

@ApiTags('Docker')
@Controller('docker')
export class DockerController {
    constructor(
        private readonly dockerService: DockerService,
        private readonly ambientesService: AmbientesService,
    ) {}

    /**
     * Obtiene el estado general del servicio Docker.
     * - running: si Docker está corriendo
     * - hasPermissions: si el usuario tiene permisos para ejecutar Docker
     * - dockerVersion: versión instalada de Docker
     * - timestamp: fecha y hora de la consulta
     */
    @Get('status')
    @ApiOperation({ summary: 'Estado general de Docker', description: 'Devuelve si Docker está corriendo, si el usuario tiene permisos y la versión instalada.' })
    @ApiResponse({ status: 200, description: 'Estado de Docker', schema: { example: {
        running: true,
        hasPermissions: true,
        dockerVersion: 'Docker version 24.0.2, build cb74dfc',
        timestamp: '2025-07-03T18:00:00Z'
    }}})
    async getDockerStatus() {
        const [running, hasPermissions, dockerVersion] = await Promise.all([
            this.dockerService.isDockerRunning(),
            this.dockerService.hasDockerPermissions(),
            this.dockerService.getDockerVersion(),
        ]);
        return {
            running,
            hasPermissions,
            dockerVersion,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Levanta un ambiente Docker ejecutando el comando definido en comandoUp.
     * @param id ID del ambiente a levantar
     */
    @Post('up/:id')
    @ApiOperation({ summary: 'Levantar ambiente', description: 'Ejecuta el comando de subida (up) para el ambiente especificado.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del ambiente' })
    @ApiResponse({ status: 200, description: 'Resultado de la ejecución', schema: { example: {
        success: true,
        stdout: 'Salida estándar del comando',
        stderr: '',
        error: null
    }}})
    async upAmbiente(@Param('id') id: number) {
        const ambiente = await this.ambientesService.findOne(id);
        if (!ambiente) throw new NotFoundException('Ambiente no encontrado');
        return this.dockerService.upAmbiente(ambiente);
    }

    /**
     * Baja un ambiente Docker ejecutando el comando definido en comandoDown.
     * @param id ID del ambiente a bajar
     */
    @Post('down/:id')
    @ApiOperation({ summary: 'Bajar ambiente', description: 'Ejecuta el comando de bajada (down) para el ambiente especificado.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del ambiente' })
    @ApiResponse({ status: 200, description: 'Resultado de la ejecución', schema: { example: {
        success: true,
        stdout: 'Salida estándar del comando',
        stderr: '',
        error: null
    }}})
    async downAmbiente(@Param('id') id: number) {
        const ambiente = await this.ambientesService.findOne(id);
        if (!ambiente) throw new NotFoundException('Ambiente no encontrado');
        return this.dockerService.downAmbiente(ambiente);
    }

    /**
     * Muestra el estado de los contenedores de un ambiente usando docker compose ps.
     * @param id ID del ambiente a consultar
     */
    @Post('ps/:id')
    @ApiOperation({ summary: 'Estado de contenedores', description: 'Muestra el estado de los contenedores del ambiente usando docker compose ps.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del ambiente' })
    @ApiResponse({ status: 200, description: 'Resultado de la ejecución', schema: { example: {
        success: true,
        stdout: 'Nombre   Estado   Puertos\nweb_1   running   80/tcp',
        stderr: '',
        error: null
    }}})
    async psAmbiente(@Param('id') id: number) {
        const ambiente = await this.ambientesService.findOne(id);
        if (!ambiente) throw new NotFoundException('Ambiente no encontrado');
        return this.dockerService.psAmbiente(ambiente);
    }
}
