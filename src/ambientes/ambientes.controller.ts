import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { AmbientesService } from './ambientes.service';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';
import { ApiTags, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ClientesService } from '../clientes/clientes.service';
import { ambienteCreateBodyDoc, ambienteCreateResponseDoc, ambienteCreateErrorDoc, ambienteFindAllQueryDocs } from './docs/ambientes-swagger.docs';

@ApiTags('Ambientes')
@Controller('ambientes')
export class AmbientesController {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly ambientesService: AmbientesService,
  ) {}

  @Post()
  @ApiBody(ambienteCreateBodyDoc)
  @ApiResponse(ambienteCreateResponseDoc)
  @ApiResponse(ambienteCreateErrorDoc)
  create(@Body() createAmbienteDto: CreateAmbienteDto) {
    return this.ambientesService.create(createAmbienteDto);
  }

  @Get()
  @ApiQuery(ambienteFindAllQueryDocs[0])
  @ApiQuery(ambienteFindAllQueryDocs[1])
  @ApiQuery(ambienteFindAllQueryDocs[2])
  @ApiQuery(ambienteFindAllQueryDocs[3])
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
  findByCliente(
    @Param('clienteId') clienteId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('nombre') nombre?: string
  ) {
    return this.ambientesService.findByCliente(Number(clienteId), { page: Number(page), limit: Number(limit), nombre });
  }

  @Get('eliminados')
  @ApiResponse({ status: 200, description: 'Lista de ambientes eliminados.' })
  findDeleted() {
    return this.ambientesService.findDeleted();
  }

  @Get(':id/ambientes/eliminados')
  async findDeletedAmbientes(@Param('id') id: number) {
    return this.ambientesService.findDeletedByCliente(Number(id));
  }
}
