
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { HasPermission } from '../decorators/has-permission.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Permisos')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}


  // Endpoint de creación deshabilitado por seguridad


  @HasPermission()
  @Get()
  @ApiOperation({ summary: 'Listar todos los permisos' })
  @ApiResponse({ status: 200, description: 'Lista de permisos.' })
  findAll() {
    return this.permissionsService.findAll();
  }


  @HasPermission()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un permiso por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Permiso encontrado.' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado.' })
  findOne(@Param('id') id: number) {
    return this.permissionsService.findOne(id);
  }


  @HasPermission()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar solo la descripción de un permiso', description: 'Solo se permite modificar el campo descripción. El nombre del permiso es inmutable.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({ status: 200, description: 'Permiso actualizado.' })
  update(@Param('id') id: number, @Body() dto: UpdatePermissionDto) {
    // Solo permitir actualizar la descripción
    const safeDto: UpdatePermissionDto = { descripcion: dto.descripcion };
    return this.permissionsService.update(id, safeDto);
  }


  @HasPermission()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un permiso' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Permiso eliminado.' })
  remove(@Param('id') id: number) {
    return this.permissionsService.remove(id);
  }
}
