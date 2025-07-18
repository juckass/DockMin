
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { HasPermission } from '../decorators/has-permission.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Permisos')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}


  // Endpoint de creación deshabilitado por seguridad. Los permisos se sincronizan automáticamente desde el código.


  /**
   * Lista todos los permisos registrados en el sistema.
   * @returns Array de objetos Permission
   */
  @HasPermission()
  @Get()
  @ApiOperation({
    summary: 'Listar todos los permisos',
    description: 'Devuelve la lista completa de permisos registrados en el sistema. Requiere autenticación y permisos adecuados.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de permisos.',
    schema: {
      example: [
        { "id": 1, "nombre": "crear_cliente", "descripcion": "Permite crear clientes" },
        { "id": 2, "nombre": "borrar_ambiente", "descripcion": "Permite borrar ambientes" }
      ]
    }
  })
  findAll() {
    return this.permissionsService.findAll();
  }


  /**
   * Obtiene un permiso específico por su ID.
   * @param id ID del permiso
   */
  @HasPermission()
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un permiso por ID',
    description: 'Devuelve un permiso específico por su identificador único.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID numérico del permiso' })
  @ApiResponse({
    status: 200,
    description: 'Permiso encontrado.',
    schema: {
      example: { "id": 1, "nombre": "crear_cliente", "descripcion": "Permite crear clientes" }
    }
  })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado.' })
  findOne(@Param('id') id: number) {
    return this.permissionsService.findOne(id);
  }


  /**
   * Actualiza solo la descripción de un permiso existente.
   * El nombre del permiso es inmutable.
   * @param id ID del permiso
   * @param dto Objeto con la nueva descripción
   */
  @HasPermission()
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar la descripción de un permiso',
    description: 'Permite modificar solo el campo descripción de un permiso. El nombre es inmutable.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID numérico del permiso' })
  @ApiBody({
    type: UpdatePermissionDto,
    examples: {
      ejemplo: {
        summary: 'Actualizar descripción',
        value: { descripcion: 'Nueva descripción del permiso' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Permiso actualizado.' })
  update(@Param('id') id: number, @Body() dto: UpdatePermissionDto) {
    // Solo permitir actualizar la descripción
    const safeDto: UpdatePermissionDto = { descripcion: dto.descripcion };
    return this.permissionsService.update(id, safeDto);
  }


  /**
   * Elimina un permiso por su ID.
   * @param id ID del permiso
   */
  @HasPermission()
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un permiso',
    description: 'Elimina un permiso existente por su identificador único.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID numérico del permiso' })
  @ApiResponse({ status: 200, description: 'Permiso eliminado.' })
  remove(@Param('id') id: number) {
    return this.permissionsService.remove(id);
  }
}
