import { getSchemaPath } from '@nestjs/swagger';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';

export const usuarioCreateBodyDoc = {
  type: CreateUsuarioDto,
  examples: {
    ejemplo: {
      summary: 'Ejemplo de creación de usuario',
      value: { correo: 'test@example.com', nombreCompleto: 'Test User', contraseña: 'password123' }
    }
  }
};

export const usuarioCreateResponseDoc = {
  status: 201,
  description: 'Usuario creado exitosamente.'
};

export const usuarioFindAllQueryDocs = [
  { name: 'page', required: false, type: Number, description: 'Número de página' },
  { name: 'limit', required: false, type: Number, description: 'Cantidad por página' }
];

export const usuarioFindOneResponseDoc = {
  status: 200,
  description: 'Usuario encontrado.'
};

export const usuarioFindOneErrorDoc = {
  status: 404,
  description: 'Usuario no encontrado.'
};

export const usuarioUpdateBodyDoc = {
  type: UpdateUsuarioDto
};

export const usuarioUpdateResponseDoc = {
  status: 200,
  description: 'Usuario actualizado.'
};

export const usuarioUpdateErrorDoc = {
  status: 404,
  description: 'No se pudo actualizar: usuario no encontrado.'
};
