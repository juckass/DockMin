import { ApiBodyOptions, ApiResponseOptions, ApiOperationOptions, ApiParamOptions } from '@nestjs/swagger';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

export const roleCreateBodyDoc: ApiBodyOptions = {
  type: CreateRoleDto,
  description: 'Datos para crear un nuevo rol',
};

export const roleCreateResponseDoc: ApiResponseOptions = {
  status: 201,
  description: 'Rol creado exitosamente.'
};

export const roleFindAllResponseDoc: ApiResponseOptions = {
  status: 200,
  description: 'Lista de roles.'
};

export const roleFindOneParamDoc: ApiParamOptions = {
  name: 'id',
  type: Number,
  description: 'ID del rol',
};

export const roleFindOneResponseDoc: ApiResponseOptions = {
  status: 200,
  description: 'Rol encontrado.'
};

export const roleFindOneErrorDoc: ApiResponseOptions = {
  status: 404,
  description: 'Rol no encontrado.'
};

export const roleUpdateBodyDoc: ApiBodyOptions = {
  type: UpdateRoleDto,
  description: 'Datos para actualizar un rol',
};

export const roleUpdateResponseDoc: ApiResponseOptions = {
  status: 200,
  description: 'Rol actualizado.'
};

export const roleDeleteParamDoc: ApiParamOptions = {
  name: 'id',
  type: Number,
  description: 'ID del rol',
};

export const roleDeleteResponseDoc: ApiResponseOptions = {
  status: 200,
  description: 'Rol eliminado.'
};
