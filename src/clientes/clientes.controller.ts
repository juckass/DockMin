import { Controller, Body, Post, Get, Param, Put, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Like } from 'typeorm';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiBody({
    type: CreateClienteDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo de creación de cliente',
        value: { nombre: 'Empresa Sura', slug: 'sura' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente.' })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad por página' })
  @ApiQuery({ name: 'nombre', required: false, type: String, description: 'Filtrar por nombre' })
  @ApiQuery({ name: 'slug', required: false, type: String, description: 'Filtrar por slug' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('nombre') nombre?: string,
    @Query('slug') slug?: string,
  ) {
    return this.clientesService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      nombre,
      slug,
    });
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateClienteDto })
  @ApiResponse({ status: 200, description: 'Cliente actualizado.' })
  @ApiResponse({ status: 404, description: 'No se pudo actualizar: cliente no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Cliente eliminado.' })
  @ApiResponse({ status: 404, description: 'No se pudo eliminar: cliente no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}