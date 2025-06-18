import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { AmbientesService } from './ambientes.service';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';
import { ApiTags, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Ambientes')
@Controller('ambientes')
export class AmbientesController {
  constructor(private readonly ambientesService: AmbientesService) {}

  @Post()
  @ApiBody({
    type: CreateAmbienteDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo de creación de ambiente',
        value: {
          clienteId: 1,
          nombre: 'qa',
          path: '/proyectos/sura/qa',
          prefijo: 'sura_qa',
          comandoUp: 'docker compose --profile=nginx up -d',
          comandoDown: 'docker compose down',
          perfiles: ['nginx', 'php', 'mysql'],
          autostart: true,
          orden: 1
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Ambiente creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'El cliente especificado no existe.' })
  create(@Body() createAmbienteDto: CreateAmbienteDto) {
    return this.ambientesService.create(createAmbienteDto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad por página' })
  @ApiQuery({ name: 'nombre', required: false, type: String, description: 'Filtrar por nombre' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por clienteId' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('nombre') nombre?: string,
    @Query('clienteId') clienteId?: number,
  ) {
    return this.ambientesService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      nombre,
      clienteId: clienteId ? Number(clienteId) : undefined,
    });
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Ambiente encontrado.' })
  @ApiResponse({ status: 404, description: 'Ambiente no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ambientesService.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateAmbienteDto })
  @ApiResponse({ status: 200, description: 'Ambiente actualizado.' })
  @ApiResponse({ status: 404, description: 'No se pudo actualizar: ambiente no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAmbienteDto: UpdateAmbienteDto,
  ) {
    return this.ambientesService.update(id, updateAmbienteDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Ambiente eliminado.' })
  @ApiResponse({ status: 404, description: 'No se pudo eliminar: ambiente no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ambientesService.remove(id);
  }


  @Get('/cliente/:clienteId')
  @ApiParam({ name: 'clienteId', type: Number, description: 'ID del cliente' })
  findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.ambientesService.findByCliente(clienteId);
  }

  @Get('eliminados')
  @ApiResponse({ status: 200, description: 'Lista de ambientes eliminados.' })
  findDeleted() {
    return this.ambientesService.findDeleted();
  }
}
