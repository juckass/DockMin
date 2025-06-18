import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Ambiente } from './entities/ambiente.entity';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';
import { Cliente } from '../clientes/entities/cliente.entity';

@Injectable()
export class AmbientesService {
  constructor(
    @InjectRepository(Ambiente)
    private readonly ambienteRepository: Repository<Ambiente>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createAmbienteDto: CreateAmbienteDto) {
    const cliente = await this.clienteRepository.findOneBy({ id: createAmbienteDto.clienteId });
    if (!cliente) {
      throw new BadRequestException('El cliente especificado no existe');
    }
    const ambiente = this.ambienteRepository.create(createAmbienteDto);
    return this.ambienteRepository.save(ambiente);
  }

  async findAll(query: { page?: number; limit?: number; nombre?: string; clienteId?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.nombre) where.nombre = Like(`%${query.nombre}%`);
    if (query.clienteId) where.clienteId = query.clienteId;

    const [data, total] = await this.ambienteRepository.findAndCount({
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
    const ambiente = await this.ambienteRepository.findOneBy({ id });
    if (!ambiente) {
      throw new NotFoundException('Ambiente no encontrado');
    }
    return ambiente;
  }

  async update(id: number, updateAmbienteDto: UpdateAmbienteDto) {
    const result = await this.ambienteRepository.update(id, updateAmbienteDto);
    if (result.affected === 0) {
      throw new NotFoundException('No se pudo actualizar: ambiente no encontrado');
    }
    return result;
  }

  async remove(id: number) {
    const result = await this.ambienteRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('No se pudo eliminar: ambiente no encontrado');
    }
    return result;
  }

  async findByCliente(clienteId: number) {
    return this.ambienteRepository.find({ where: { clienteId } });
  } 

  async findAllWithDeleted() {
    return this.ambienteRepository.find({ withDeleted: true });
  }

  async findDeleted() {
    const all = await this.ambienteRepository.find({ withDeleted: true });
    return all.filter(a => a.deletedAt !== undefined);
  }
}
