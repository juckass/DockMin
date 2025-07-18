
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
  
  

  @HasPermission()
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol', description: 'Crea un rol y asigna permisos.' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente.' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }


  @HasPermission()
  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles.' })
  findAll() {
    return this.rolesService.findAll();
  }


  @HasPermission()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Rol encontrado.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  findOne(@Param('id') id: number) {
    return this.rolesService.findOne(id);
  }


  @HasPermission()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol', description: 'Permite actualizar nombre y permisos del rol.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Rol actualizado.' })
  update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }


  @HasPermission()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Rol eliminado.' })
  remove(@Param('id') id: number) {
    return this.rolesService.remove(id);
  }
}
