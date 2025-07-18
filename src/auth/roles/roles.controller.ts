
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { HasPermission } from '../decorators/has-permission.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';



import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  
  


  /**
   * Crea un nuevo rol y asigna permisos.
   * @param dto Datos del rol a crear
   */
  @HasPermission()
  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo rol',
    description: 'Crea un rol y asigna uno o más permisos existentes.'
  })
  @ApiBody({
    type: CreateRoleDto,
    examples: {
      ejemplo: {
        summary: 'Crear rol admin',
        value: { nombre: 'admin', permisos: [1, 2] }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente.' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }



  /**
   * Lista todos los roles registrados en el sistema.
   * @returns Array de objetos Role
   */
  @HasPermission()
  @Get()
  @ApiOperation({
    summary: 'Listar todos los roles',
    description: 'Devuelve la lista completa de roles registrados en el sistema. Incluye los permisos asignados a cada rol.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles.',
    schema: {
      example: [
        {
          id: 1,
          nombre: 'admin',
          permisos: [
            { id: 1, nombre: 'crear_cliente', descripcion: 'Permite crear clientes' }
          ]
        }
      ]
    }
  })
  findAll() {
    return this.rolesService.findAll();
  }



  /**
   * Obtiene un rol específico por su ID.
   * @param id ID del rol
   */
  @HasPermission()
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un rol por ID',
    description: 'Devuelve un rol específico por su identificador único, incluyendo sus permisos.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID numérico del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado.',
    schema: {
      example: {
        id: 1,
        nombre: 'admin',
        permisos: [
          { id: 1, nombre: 'crear_cliente', descripcion: 'Permite crear clientes' }
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  findOne(@Param('id') id: number) {
    return this.rolesService.findOne(id);
  }



  /**
   * Actualiza el nombre y/o los permisos de un rol existente.
   * @param id ID del rol
   * @param dto Objeto con los nuevos datos
   */
  @HasPermission()
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un rol',
    description: 'Permite actualizar el nombre y/o los permisos asignados al rol.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID numérico del rol' })
  @ApiBody({
    type: UpdateRoleDto,
    examples: {
      ejemplo: {
        summary: 'Actualizar permisos',
        value: { nombre: 'admin', permisos: [1, 2] }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Rol actualizado.' })
  update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }



  /**
   * Elimina un rol por su ID.
   * @param id ID del rol
   */
  @HasPermission()
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un rol',
    description: 'Elimina un rol existente por su identificador único.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID numérico del rol' })
  @ApiResponse({ status: 200, description: 'Rol eliminado.' })
  remove(@Param('id') id: number) {
    return this.rolesService.remove(id);
  }
}
