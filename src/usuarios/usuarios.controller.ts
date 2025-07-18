import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { usuarioCreateBodyDoc, usuarioCreateResponseDoc, usuarioFindAllQueryDocs, usuarioFindOneResponseDoc, usuarioFindOneErrorDoc, usuarioUpdateBodyDoc, usuarioUpdateResponseDoc, usuarioUpdateErrorDoc } from './docs/usuarios-swagger.docs';
import { HasPermission } from '../auth/decorators/has-permission.decorator';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';


/**
 * Controlador para la gestión de usuarios.
 * Incluye endpoints para CRUD, restauración y paginación.
 *
 * Todos los endpoints requieren autenticación JWT y permisos adecuados.
 *
 * Ejemplo de uso (Swagger):
 *   - Crear usuario
 *   - Listar usuarios paginados
 *   - Actualizar usuario por ID
 *   - Eliminar y restaurar usuario
 */
@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Crea un nuevo usuario.
   * @param createUsuarioDto Datos del usuario a crear
   * @returns Usuario creado
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission()
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario', description: 'Crea un usuario con correo, nombre completo y contraseña.' })
  @ApiResponse(usuarioCreateResponseDoc)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    try {
      return await this.usuariosService.create(createUsuarioDto);
    } catch (error) {
      if (error.statusCode) {
        return { statusCode: error.statusCode, message: error.message };
      }
      return { statusCode: 500, message: 'Error interno del servidor', error: error.message };
    }
  }
  
  /**
   * Obtiene todos los usuarios con paginación.
   * @param query Parámetros de paginación (page, limit)
   * @returns Lista paginada de usuarios
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission()
  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios con paginación', description: 'Devuelve una lista paginada de usuarios activos.' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios.' })
  async findAll(@Query() query: { page?: number; limit?: number }) {
    try {
      return await this.usuariosService.findAll(query);
    } catch (error) {
      return { statusCode: 500, message: 'Error interno del servidor', error: error.message };
    }
  }
  /**
   * Obtiene todos los usuarios eliminados (soft delete) con paginación.
   * @param query Parámetros de paginación (page, limit)
   * @returns Lista paginada de usuarios eliminados
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission()
  @Get('eliminados')
  @ApiOperation({ summary: 'Obtener todos los usuarios eliminados con paginación', description: 'Devuelve una lista paginada de usuarios eliminados (soft delete).' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios eliminados.' })
  async findDeleted(@Query() query: { page?: number; limit?: number }) {
    try {
      return await this.usuariosService.findDeleted(query);
    } catch (error) {
      return { statusCode: 500, message: 'Error interno del servidor', error: error.message };
    }
  }


  /**
   * Obtiene un usuario por su ID.
   * @param id ID del usuario
   * @returns Usuario encontrado o mensaje de error
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID', description: 'Busca y devuelve un usuario por su identificador único.' })
  @ApiResponse(usuarioFindOneResponseDoc)
  @ApiResponse(usuarioFindOneErrorDoc)
  async findOne(@Param('id') id: number) {
    try {
      const usuario = await this.usuariosService.findOne(id);
      if (!usuario) {
        return { statusCode: 404, message: 'Usuario no encontrado' };
      }
      return usuario;
    } catch (error) {
      return { statusCode: 500, message: 'Error interno del servidor', error: error.message };
    }
  }

  /**
   * Actualiza parcialmente un usuario por su ID.
   * @param id ID del usuario
   * @param updateUsuarioDto Datos a actualizar (parciales)
   * @returns Usuario actualizado o mensaje de error
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por ID', description: 'Actualiza los datos de un usuario existente. Solo se modifican los campos enviados.' })
  @ApiResponse(usuarioUpdateResponseDoc)
  @ApiResponse(usuarioUpdateErrorDoc)
  async update(@Param('id') id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const usuario = await this.usuariosService.update(id, updateUsuarioDto);
      if (!usuario) {
        return { statusCode: 404, message: 'Usuario no encontrado para actualizar' };
      }
      return usuario;
    } catch (error) {
      if (error.statusCode) {
        return { statusCode: error.statusCode, message: error.message };
      }
      return { statusCode: 500, message: 'Error interno del servidor', error: error.message };
    }
  }

  /**
   * Elimina (soft delete) un usuario por su ID.
   * @param id ID del usuario
   * @returns Mensaje de éxito o error
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID', description: 'Elimina lógicamente (soft delete) un usuario. No se borra físicamente.' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async remove(@Param('id') id: number) {
    try {
      const usuario = await this.usuariosService.remove(id);
      return { message: 'Usuario eliminado correctamente', usuario };
    } catch (error) {
      if (error.statusCode) {
        return { statusCode: error.statusCode, message: error.message };
      }
      return { statusCode: 500, message: 'Error interno del servidor', error: error.message };
    }
  }

  
  /**
   * Restaura un usuario eliminado (soft delete) por su ID.
   * @param id ID del usuario
   * @returns Usuario restaurado o mensaje de error
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission()
  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar un usuario eliminado por ID', description: 'Restaura un usuario previamente eliminado (soft delete).' })
  @ApiResponse({ status: 200, description: 'Usuario restaurado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado o no está eliminado.' })
  async restore(@Param('id') id: number) {
    try {
      const usuario = await this.usuariosService.restore(id);
      if (!usuario) {
        return { statusCode: 404, message: 'Usuario no encontrado o no está eliminado' };
      }
      return usuario;
    } catch (error) {
      if (error.statusCode) {
        return { statusCode: error.statusCode, message: error.message };
      }
      return { statusCode: 500, message: 'Error interno del servidor', error: error.message };
    }
  }
}
