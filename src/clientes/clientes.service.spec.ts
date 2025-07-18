import { Test, TestingModule } from '@nestjs/testing';
import { ClientesService } from './clientes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository, Like } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { slugify } from '../core/utils/slugify';

jest.mock('../core/utils/slugify', () => ({
  slugify: jest.fn((nombre: string) => nombre.toLowerCase().replace(/\s+/g, '-')),
}));

describe('ClientesService', () => {
  let service: ClientesService;
  let clienteRepository: jest.Mocked<Partial<Repository<Cliente>>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: getRepositoryToken(Cliente),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
    clienteRepository = module.get(getRepositoryToken(Cliente));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a cliente with auto-generated slug', async () => {
    const dto: CreateClienteDto = { nombre: 'Empresa Test' };
    const slug = slugify(dto.nombre);
    const entity: Cliente = { id: 1, nombre: dto.nombre, slug };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue(null);
    (clienteRepository.create as jest.Mock).mockReturnValue(entity);
    (clienteRepository.save as jest.Mock).mockResolvedValue(entity);

    const result = await service.create(dto);
    expect(slugify).toHaveBeenCalledWith(dto.nombre);
    expect(clienteRepository.findOneBy).toHaveBeenCalledWith({ slug });
    expect(clienteRepository.create).toHaveBeenCalledWith({ ...dto, slug });
    expect(clienteRepository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('should throw BadRequestException if slug already exists on create', async () => {
    const dto: CreateClienteDto = { nombre: 'Empresa prueba' };
    const slug = slugify(dto.nombre);
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue({ id: 2, nombre: 'Otro', slug });

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if cliente nombre already exists', async () => {
    const createDto = { nombre: 'DemoCorp' };
    // Simula que ya existe un cliente con ese nombre
    (clienteRepository.findOneBy as jest.Mock).mockImplementation(({ nombre }) => {
      if (nombre === 'DemoCorp') return { id: 1, nombre: 'DemoCorp' };
      return null;
    });

    await expect(service.create(createDto as any)).rejects.toThrow(BadRequestException);
  });

  it('should return paginated clientes with filters', async () => {
    const clientes = [{ id: 1, nombre: 'Test', slug: 'test' }];
    const total = 1;
    (clienteRepository.findAndCount as jest.Mock).mockResolvedValue([clientes, total]);

    const result = await service.findAll({ page: 1, limit: 10, nombre: 'Test', slug: 'test' });

    expect(clienteRepository.findAndCount).toHaveBeenCalledWith({
      where: { nombre: Like('%Test%'), slug: Like('%test%') },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      data: clientes,
      total,
      page: 1,
      lastPage: 1,
    });
  });

  it('should return all clientes', async () => {
    const clientes: Cliente[] = [{ id: 1, nombre: 'Test', slug: 'test' }];
    const total = 1;
    (clienteRepository.findAndCount as jest.Mock).mockResolvedValue([clientes, total]);

    const result = await service.findAll({});
    expect(clienteRepository.findAndCount).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      data: clientes,
      total,
      page: 1,
      lastPage: 1,
    });
  });

  it('should return one cliente by id', async () => {
    const cliente: Cliente = { id: 1, nombre: 'Test', slug: 'test' };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue(cliente);

    const result = await service.findOne(1);
    expect(clienteRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(cliente);
  });

  it('should throw NotFoundException if cliente not found', async () => {
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    expect(clienteRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
  });

  it('should update a cliente and regenerate slug if nombre changes', async () => {
    const dto: UpdateClienteDto = { nombre: 'Nuevo Nombre' };
    const slug = dto.nombre ? slugify(dto.nombre) : undefined;
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue(null);
    (clienteRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

    const result = await service.update(1, dto);

    if (dto.nombre) {
      expect(slugify).toHaveBeenCalledWith(dto.nombre);
      expect(clienteRepository.findOneBy).toHaveBeenCalledWith({ slug });
      expect(clienteRepository.update).toHaveBeenCalledWith(1, { ...dto, slug });
    } else {
      expect(clienteRepository.update).toHaveBeenCalledWith(1, dto);
    }
    expect(result).toEqual({ affected: 1 });
  });

  it('should throw BadRequestException if slug already exists on update', async () => {
    const dto: UpdateClienteDto = { nombre: 'Empresa prueba' };
    const slug = dto.nombre ? slugify(dto.nombre) : undefined;
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue({ id: 2, nombre: 'Otro', slug });

    await expect(service.update(1, dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if cliente not found on update', async () => {
    const dto: UpdateClienteDto = { nombre: 'Nuevo Nombre' };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue(null);
    // Simula que no se actualizó ningún registro
    (clienteRepository.update as jest.Mock).mockResolvedValue({ affected: 0 });

    await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
  });

  it('should remove a cliente (soft delete)', async () => {
    (clienteRepository.softDelete as jest.Mock).mockResolvedValue({ affected: 1 });

    const result = await service.remove(1);
    expect(clienteRepository.softDelete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Cliente eliminado correctamente.' });
  });
  it('should restore a cliente and return the restored object', async () => {
    (clienteRepository.restore as jest.Mock).mockResolvedValue({ affected: 1 });
    const cliente: Cliente = { id: 1, nombre: 'Test', slug: 'test' };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue(cliente);

    const result = await service.restore(1);
    expect(clienteRepository.restore).toHaveBeenCalledWith(1);
    expect(clienteRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(cliente);
  });

  it('should throw NotFoundException if cliente to remove does not exist', async () => {
    // Simula que no se eliminó ningún registro
    (clienteRepository.softDelete as jest.Mock).mockResolvedValue({ affected: 0 });

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});