import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto) {
    // Verifica si ya existe un cliente con el mismo slug
    const existing = await this.clienteRepository.findOneBy({ slug: createClienteDto.slug });
    if (existing) {
      throw new BadRequestException('Ya existe un cliente con ese slug');
    }
    const cliente = this.clienteRepository.create(createClienteDto);
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
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    // Si se va a actualizar el slug, verifica que no exista en otro cliente
    if (updateClienteDto.slug) {
      const existing = await this.clienteRepository.findOneBy({ slug: updateClienteDto.slug });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Ya existe un cliente con ese slug');
      }
    }
    const result = await this.clienteRepository.update(id, updateClienteDto);
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
    return result;
  }

  async findAllWithDeleted() {
    return this.clienteRepository.find({ withDeleted: true });
  }
}