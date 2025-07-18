import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { usuarioCreateBodyDoc, usuarioCreateResponseDoc, usuarioFindAllQueryDocs, usuarioFindOneResponseDoc, usuarioFindOneErrorDoc, usuarioUpdateBodyDoc, usuarioUpdateResponseDoc, usuarioUpdateErrorDoc } from './docs/usuarios-swagger.docs';
import { HasPermission } from '../auth/decorators/has-permission.decorator';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @HasPermission()
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse(usuarioCreateResponseDoc)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }
  
  @HasPermission()
  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios con paginación' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios.' })
  async findAll(@Query() query: { page?: number; limit?: number }) {
    return this.usuariosService.findAll(query);
  }
  @HasPermission()
  @Get('eliminados')
  @ApiOperation({ summary: 'Obtener todos los usuarios eliminados con paginación' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios eliminados.' })
  async findDeleted(@Query() query: { page?: number; limit?: number }) {
    return this.usuariosService.findDeleted(query);
  }


  @HasPermission()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse(usuarioFindOneResponseDoc)
  @ApiResponse(usuarioFindOneErrorDoc)
  async findOne(@Param('id') id: number) {
    const usuario = await this.usuariosService.findOne(id);
    if (!usuario) {
      return { message: 'Usuario no encontrado' };
    }
    return usuario;
  }

  @HasPermission()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiResponse(usuarioUpdateResponseDoc)
  @ApiResponse(usuarioUpdateErrorDoc)
  async update(@Param('id') id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuariosService.update(id, updateUsuarioDto);
    if (!usuario) {
      return { message: 'Usuario no encontrado para actualizar' };
    }
    return usuario;
  }

  @HasPermission()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async remove(@Param('id') id: number) {
    try {
      const usuario = await this.usuariosService.remove(id);
      return { message: 'Usuario eliminado correctamente', usuario };
    } catch (error) {
      return { statusCode: 500, message: 'Error interno del servidor', error: error.message };
    }
  }

  
  @HasPermission()
  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar un usuario eliminado por ID' })
  @ApiResponse({ status: 200, description: 'Usuario restaurado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado o no está eliminado.' })
  async restore(@Param('id') id: number) {
    try {
      const usuario = await this.usuariosService.restore(id);
      return usuario;
    } catch (error) {
      return { statusCode: 404, message: error.message };
    }
  }
}
