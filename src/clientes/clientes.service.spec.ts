import { Test, TestingModule } from '@nestjs/testing';
import { ClientesService } from './clientes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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

  it('should create a cliente', async () => {
    const dto: CreateClienteDto = { nombre: 'Test', slug: 'test' };
    const entity: Cliente = { id: 1, ...dto };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue(null);
    (clienteRepository.create as jest.Mock).mockReturnValue(entity);
    (clienteRepository.save as jest.Mock).mockResolvedValue(entity);

    const result = await service.create(dto);
    expect(clienteRepository.findOneBy).toHaveBeenCalledWith({ slug: dto.slug });
    expect(clienteRepository.create).toHaveBeenCalledWith(dto);
    expect(clienteRepository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('should throw BadRequestException if slug already exists on create', async () => {
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue({ id: 2, nombre: 'Otro', slug: 'test' });
    await expect(service.create({ nombre: 'Test', slug: 'test' })).rejects.toThrow(BadRequestException);
  });

  it('should return paginated clientes with filters', async () => {
    const clientes = [{ id: 1, nombre: 'Test', slug: 'test' }];
    const total = 1;
    (clienteRepository.findAndCount as jest.Mock).mockResolvedValue([clientes, total]);

    const result = await service.findAll({ page: 1, limit: 10, nombre: 'Test', slug: 'test' });

    expect(clienteRepository.findAndCount).toHaveBeenCalledWith({
      where: { nombre: expect.any(Object), slug: expect.any(Object) },
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

  it('should update a cliente', async () => {
    const dto: UpdateClienteDto = { nombre: 'Nuevo' };
    (clienteRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

    const result = await service.update(1, dto);
    expect(clienteRepository.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ affected: 1 });
  });

  it('should throw NotFoundException if cliente not found on update', async () => {
    const dto: UpdateClienteDto = { nombre: 'Nuevo' };
    (clienteRepository.update as jest.Mock).mockResolvedValue({ affected: 0 });

    await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if slug already exists on update', async () => {
    (clienteRepository.findOneBy as jest.Mock)
      .mockResolvedValueOnce({ id: 2, nombre: 'Otro', slug: 'test' });
    await expect(service.update(1, { slug: 'test' })).rejects.toThrow(BadRequestException);
  });

  it('should remove a cliente (soft delete)', async () => {
    (clienteRepository.softDelete as jest.Mock).mockResolvedValue({ affected: 1 });

    const result = await service.remove(1);
    expect(clienteRepository.softDelete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ affected: 1 });
  });

  it('should throw NotFoundException if cliente not found on remove', async () => {
    (clienteRepository.softDelete as jest.Mock).mockResolvedValue({ affected: 0 });

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});