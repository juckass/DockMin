import { ApiBodyOptions, ApiResponseOptions, ApiOperationOptions, ApiParamOptions } from '@nestjs/swagger';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

export const permissionCreateBodyDoc: ApiBodyOptions = {
  type: CreatePermissionDto,
  description: 'Datos para crear un nuevo permiso',
};

export const permissionCreateResponseDoc: ApiResponseOptions = {
  status: 201,
  description: 'Permiso creado exitosamente.'
};

export const permissionFindAllResponseDoc: ApiResponseOptions = {
  status: 200,
  description: 'Lista de permisos.'
};

export const permissionFindOneParamDoc: ApiParamOptions = {
  name: 'id',
  type: Number,
  description: 'ID del permiso',
};

export const permissionFindOneResponseDoc: ApiResponseOptions = {
  status: 200,
  description: 'Permiso encontrado.'
};

export const permissionFindOneErrorDoc: ApiResponseOptions = {
  status: 404,
  description: 'Permiso no encontrado.'
};

export const permissionUpdateBodyDoc: ApiBodyOptions = {
  type: UpdatePermissionDto,
  description: 'Datos para actualizar un permiso',
};

export const permissionUpdateResponseDoc: ApiResponseOptions = {
  status: 200,
  description: 'Permiso actualizado.'
};

export const permissionDeleteParamDoc: ApiParamOptions = {
  name: 'id',
  type: Number,
  description: 'ID del permiso',
};

export const permissionDeleteResponseDoc: ApiResponseOptions = {
  status: 200,
  description: 'Permiso eliminado.'
};
