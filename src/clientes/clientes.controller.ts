import { Controller, Body, Post, Get, Param, Put, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Like } from 'typeorm';
import { clienteCreateBodyDoc, clienteCreateResponseDoc, clienteFindAllQueryDocs, clienteFindOneResponseDoc, clienteFindOneErrorDoc, clienteUpdateBodyDoc, clienteUpdateResponseDoc, clienteUpdateErrorDoc } from './docs/clientes-swagger.docs';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';


@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Clientes')
@ApiBearerAuth()
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @HasPermission()
  @Post()
  @ApiBody(clienteCreateBodyDoc)
  @ApiResponse(clienteCreateResponseDoc)
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @HasPermission()
  @Get()
  @ApiQuery(clienteFindAllQueryDocs[0])
  @ApiQuery(clienteFindAllQueryDocs[1])
  @ApiQuery(clienteFindAllQueryDocs[2])
  @ApiQuery(clienteFindAllQueryDocs[3])
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


  /**
   * Lista solo los clientes eliminados (borrado lógico)
   */
  @HasPermission()
  @Get('eliminados')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de clientes eliminados.' })
  findAllDeleted(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.clientesService.findAllDeleted({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @HasPermission()
  @Get(':id')
  @ApiResponse(clienteFindOneResponseDoc)
  @ApiResponse(clienteFindOneErrorDoc)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @HasPermission()
  @Put(':id')
  @ApiBody(clienteUpdateBodyDoc)
  @ApiResponse(clienteUpdateResponseDoc)
  @ApiResponse(clienteUpdateErrorDoc)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }
  
  @HasPermission()
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Cliente eliminado.' })
  @ApiResponse({ status: 404, description: 'No se pudo eliminar: cliente no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
  

  /**
   * Restaura un cliente eliminado lógicamente
   */
  @HasPermission()
  @Put(':id/restaurar')
  @ApiResponse({ status: 200, description: 'Cliente restaurado.' })
  @ApiResponse({ status: 404, description: 'No se pudo restaurar: cliente no encontrado o no estaba eliminado.' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.restore(id);
  }
}