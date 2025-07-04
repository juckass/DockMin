import { getSchemaPath } from '@nestjs/swagger';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';

export const clienteCreateBodyDoc = {
  type: CreateClienteDto,
  examples: {
    ejemplo: {
      summary: 'Ejemplo de creación de cliente',
      value: { nombre: 'Empresa Sura', slug: 'sura' }
    }
  }
};

export const clienteCreateResponseDoc = {
  status: 201,
  description: 'Cliente creado exitosamente.'
};

export const clienteFindAllQueryDocs = [
  { name: 'page', required: false, type: Number, description: 'Número de página' },
  { name: 'limit', required: false, type: Number, description: 'Cantidad por página' },
  { name: 'nombre', required: false, type: String, description: 'Filtrar por nombre' },
  { name: 'slug', required: false, type: String, description: 'Filtrar por slug' }
];

export const clienteFindOneResponseDoc = {
  status: 200,
  description: 'Cliente encontrado.'
};

export const clienteFindOneErrorDoc = {
  status: 404,
  description: 'Cliente no encontrado.'
};

export const clienteUpdateBodyDoc = {
  type: UpdateClienteDto
};

export const clienteUpdateResponseDoc = {
  status: 200,
  description: 'Cliente actualizado.'
};

export const clienteUpdateErrorDoc = {
  status: 404,
  description: 'No se pudo actualizar: cliente no encontrado.'
};
