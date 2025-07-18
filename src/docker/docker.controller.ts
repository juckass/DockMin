import { Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiExtraModels, getSchemaPath, ApiBearerAuth } from '@nestjs/swagger';
import { DockerService } from './docker.service';
import { AmbientesService } from '../ambientes/ambientes.service';
import { DockerCommandResultDto } from './dto/docker-command-result.dto';
import { dockerUpResponseDoc, dockerDownResponseDoc, dockerPsResponseDoc } from './docs/docker-swagger.docs';
import { HasPermission } from '../auth/decorators/has-permission.decorator';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';



@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Docker')
@ApiBearerAuth()
@ApiExtraModels(DockerCommandResultDto)
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
    @HasPermission()
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
    @HasPermission()
    @Post('up/:id')
    @ApiOperation({ summary: 'Levantar ambiente', description: 'Ejecuta el comando de subida (up) para el ambiente especificado.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del ambiente' })
    @ApiResponse(dockerUpResponseDoc)
    async upAmbiente(@Param('id') id: number): Promise<DockerCommandResultDto & { parsed: any }> {
        const ambiente = await this.ambientesService.findOne(id);
        if (!ambiente) throw new NotFoundException('Ambiente no encontrado');
        return this.dockerService.upAmbiente(ambiente);
    }

    /**
     * Baja un ambiente Docker ejecutando el comando definido en comandoDown.
     * @param id ID del ambiente a bajar
     */
    @HasPermission()
    @Post('down/:id')
    @ApiOperation({ summary: 'Bajar ambiente', description: 'Ejecuta el comando de bajada (down) para el ambiente especificado.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del ambiente' })
    @ApiResponse(dockerDownResponseDoc)
    async downAmbiente(@Param('id') id: number): Promise<DockerCommandResultDto & { parsed: any }> {
        const ambiente = await this.ambientesService.findOne(id);
        if (!ambiente) throw new NotFoundException('Ambiente no encontrado');
        return this.dockerService.downAmbiente(ambiente);
    }

    /**
     * Muestra el estado de los contenedores de un ambiente usando docker compose ps.
     * @param id ID del ambiente a consultar
     */
    @HasPermission()
    @Post('ps/:id')
    @ApiOperation({ summary: 'Estado de contenedores', description: 'Muestra el estado de los contenedores del ambiente usando docker compose ps.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del ambiente' })
    @ApiResponse(dockerPsResponseDoc)
    async psAmbiente(@Param('id') id: number): Promise<DockerCommandResultDto & { parsed: any }> {
        const ambiente = await this.ambientesService.findOne(id);
        if (!ambiente) throw new NotFoundException('Ambiente no encontrado');
        return this.dockerService.psAmbiente(ambiente);
    }
}
