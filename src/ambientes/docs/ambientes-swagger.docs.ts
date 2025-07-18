import { getSchemaPath } from '@nestjs/swagger';
import { CreateAmbienteDto } from '../dto/create-ambiente.dto';
import { UpdateAmbienteDto } from '../dto/update-ambiente.dto';

export const ambienteCreateBodyDoc = {
  type: CreateAmbienteDto,
  examples: {
    ejemplo: {
      summary: 'Ejemplo de creación de ambiente',
      value: {
        clienteId: 1,
        nombre: 'qa',
        path: '/proyectos/prueba/qa',
        prefijo: 'prueba_qa',
        comandoUp: 'docker compose --profile=nginx up -d',
        comandoDown: 'docker compose down',
        perfiles: ['nginx', 'php', 'mysql'],
        autostart: true,
        orden: 1
      }
    }
  }
};

export const ambienteCreateResponseDoc = {
  status: 201,
  description: 'Ambiente creado exitosamente.'
};

export const ambienteCreateErrorDoc = {
  status: 400,
  description: 'El cliente especificado no existe.'
};

export const ambienteFindAllQueryDocs = [
  { name: 'page', required: false, type: Number, description: 'Número de página' },
  { name: 'limit', required: false, type: Number, description: 'Cantidad por página' },
  { name: 'nombre', required: false, type: String, description: 'Filtrar por nombre' },
  { name: 'clienteId', required: false, type: Number, description: 'Filtrar por clienteId' }
];
