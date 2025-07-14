import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { usuarioCreateBodyDoc, usuarioCreateResponseDoc, usuarioFindAllQueryDocs, usuarioFindOneResponseDoc, usuarioFindOneErrorDoc, usuarioUpdateBodyDoc, usuarioUpdateResponseDoc, usuarioUpdateErrorDoc } from './docs/usuarios-swagger.docs';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse(usuarioCreateResponseDoc)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios con paginación' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios.' })
  async findAll(@Query() query: { page?: number; limit?: number }) {
    return this.usuariosService.findAll(query);
  }

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

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async remove(@Param('id') id: number) {
    try {
      const usuario = await this.usuariosService.findOne(id);
      if (!usuario) {
        return { statusCode: 404, message: 'Usuario no encontrado.' };
      }
      await this.usuariosService.remove(id);
      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      return { statusCode: 500, message: 'Error interno del servidor', error: error.message };
    }
  }
}
