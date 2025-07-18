import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { HasPermission } from '../decorators/has-permission.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

 /* @HasPermission()
  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }*/

  @HasPermission()
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @HasPermission()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.permissionsService.findOne(id);
  }

  @HasPermission()
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdatePermissionDto) {
    // Solo permitir actualizar la descripción
    const safeDto: UpdatePermissionDto = { descripcion: dto.descripcion };
    return this.permissionsService.update(id, safeDto);
  }

  @HasPermission()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.permissionsService.remove(id);
  }
}
