import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { HasPermission } from '../decorators/has-permission.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  
  
  @HasPermission()
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @HasPermission()
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @HasPermission()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rolesService.findOne(id);
  }

  @HasPermission()
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @HasPermission()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.rolesService.remove(id);
  }
}
