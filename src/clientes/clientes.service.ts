import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, IsNull } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { slugify } from '../core/utils/slugify';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto) {
    const slug = slugify(createClienteDto.nombre);

    // Validar que no exista un cliente con el mismo nombre
    const existingNombre = await this.clienteRepository.findOneBy({ nombre: createClienteDto.nombre });
    if (existingNombre) {
      throw new BadRequestException('Ya existe un cliente con ese nombre. Por favor, elige otro.');
    }

    // Validar que no exista un cliente con el mismo slug
    const existingSlug = await this.clienteRepository.findOneBy({ slug });
    if (existingSlug) {
      throw new BadRequestException('El identificador generado (slug) ya existe. Cambia el nombre del cliente.');
    }

    const cliente = this.clienteRepository.create({
      ...createClienteDto,
      slug,
    });
    return this.clienteRepository.save(cliente);
  }

  async findAll(query: { page?: number; limit?: number; nombre?: string; slug?: string }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.nombre) where.nombre = Like(`%${query.nombre}%`);
    if (query.slug) where.slug = Like(`%${query.slug}%`);

    const [data, total] = await this.clienteRepository.findAndCount({
      where,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepository.findOneBy({ id });
    if (!cliente) {
      throw new NotFoundException('El cliente especificado no existe. Verifica el clienteId.');
    }
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    let slug: string | undefined;
    if (updateClienteDto.nombre) {
      slug = slugify(updateClienteDto.nombre);

      // Validar que no exista otro cliente con el mismo nombre
      const existingNombre = await this.clienteRepository.findOneBy({ nombre: updateClienteDto.nombre });
      if (existingNombre && existingNombre.id !== id) {
        throw new BadRequestException('Ya existe un cliente con ese nombre');
      }

      // Validar que no exista otro cliente con el mismo slug
      const existingSlug = await this.clienteRepository.findOneBy({ slug });
      if (existingSlug && existingSlug.id !== id) {
        throw new BadRequestException('Ya existe un cliente con ese slug');
      }
    }
    const result = await this.clienteRepository.update(id, {
      ...updateClienteDto,
      ...(slug ? { slug } : {}),
    });
    if (result.affected === 0) {
      throw new NotFoundException('No se pudo actualizar: cliente no encontrado');
    }
    return result;
  }

  async remove(id: number) {
    const result = await this.clienteRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('No se pudo eliminar: cliente no encontrado');
    }
    return { message: 'Cliente eliminado correctamente.' };
  }

  /**
   * Lista solo los clientes eliminados (borrado lógico)
   */
  async findAllDeleted(query: { page?: number; limit?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.clienteRepository.findAndCount({
      withDeleted: true,
      where: {
        deletedAt: Not(IsNull()),
      },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /**
   * Restaura un cliente eliminado lógicamente
   */
  async restore(id: number) {
    const result = await this.clienteRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('No se pudo restaurar: cliente no encontrado o no estaba eliminado');
    }
    // Devolver el cliente restaurado
    const cliente = await this.clienteRepository.findOneBy({ id });
    return cliente;
  }

  async findAllWithDeleted() {
    return this.clienteRepository.find({ withDeleted: true });
  }
}