import { Test, TestingModule } from '@nestjs/testing';
import { AmbientesService } from './ambientes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ambiente } from './entities/ambiente.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Repository, Like } from 'typeorm';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

describe('AmbientesService', () => {
  let service: AmbientesService;
  let ambienteRepository: jest.Mocked<Partial<Repository<Ambiente>>>;
  let clienteRepository: jest.Mocked<Partial<Repository<Cliente>>>;
  let existsSyncSpy: jest.SpyInstance;
  let statSyncSpy: jest.SpyInstance;
  const BASE_PATH = '/base/ambientes';

  beforeEach(async () => {
    existsSyncSpy = jest.spyOn(fs, 'existsSync');
    statSyncSpy = jest.spyOn(fs, 'statSync');
    jest.spyOn(path, 'resolve').mockImplementation((base: string, target?: string) => {
      if (typeof target === 'undefined') return base;
      // Simula path.resolve para pruebas de seguridad de path
      if (target.startsWith('..')) return '/etc/passwd';
      if (target.startsWith('/')) return target;
      return base + (base.endsWith('/') ? '' : '/') + target;
    });
    process.env.AMBIENTES_BASE_PATH = BASE_PATH;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmbientesService,
        {
          provide: getRepositoryToken(Ambiente),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAndCount: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Cliente),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AMBIENTES_BASE_PATH') return BASE_PATH;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AmbientesService>(AmbientesService);
    ambienteRepository = module.get(getRepositoryToken(Ambiente));
    clienteRepository = module.get(getRepositoryToken(Cliente));
    jest.clearAllMocks();
  });

  afterEach(() => {
    existsSyncSpy.mockRestore();
    statSyncSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an ambiente if cliente exists', async () => {
    const dto: CreateAmbienteDto = {
      clienteId: 1,
      nombre: 'qa',
      path: 'qa',
      comandoUp: 'docker compose up -d',
      comandoDown: 'docker compose down',
    };
    // El servicio transforma el path a relativo a la base
    const entity: Ambiente = { id: 1, ...dto, path: '/qa' };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Demo', slug: 'demo' });
    (ambienteRepository.create as jest.Mock).mockReturnValue(entity);
    (ambienteRepository.save as jest.Mock).mockResolvedValue(entity);
    existsSyncSpy.mockReturnValue(true);
    statSyncSpy.mockReturnValue({ isDirectory: () => true } as any);

    const result = await service.create(dto);
    expect(clienteRepository.findOneBy).toHaveBeenCalledWith({ id: dto.clienteId });
    expect(ambienteRepository.create).toHaveBeenCalledWith(dto); // path: 'qa'
    expect(ambienteRepository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('should throw BadRequestException if cliente does not exist', async () => {
    const dto: CreateAmbienteDto = {
      clienteId: 999,
      nombre: 'qa',
      path: '/proyectos/demo/qa',
      comandoUp: 'docker compose up -d',
      comandoDown: 'docker compose down',
    };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if path is outside base path', async () => {
    const dto: CreateAmbienteDto = {
      clienteId: 1,
      nombre: 'qa',
      path: '../../etc/passwd',
      comandoUp: 'docker compose up -d',
      comandoDown: 'docker compose down',
    };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Demo', slug: 'demo' });
    existsSyncSpy.mockReturnValue(true);
    statSyncSpy.mockReturnValue({ isDirectory: () => true } as any);
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if directory does not exist', async () => {
    const dto: CreateAmbienteDto = {
      clienteId: 1,
      nombre: 'qa',
      path: '/base/ambientes/qa',
      comandoUp: 'docker compose up -d',
      comandoDown: 'docker compose down',
    };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Demo', slug: 'demo' });
    existsSyncSpy.mockReturnValue(false);
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if path exists but is not a directory', async () => {
    const dto: CreateAmbienteDto = {
      clienteId: 1,
      nombre: 'qa',
      path: '/base/ambientes/qa',
      comandoUp: 'docker compose up -d',
      comandoDown: 'docker compose down',
    };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Demo', slug: 'demo' });
    existsSyncSpy.mockReturnValue(true);
    statSyncSpy.mockReturnValue({ isDirectory: () => false } as any);
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should return paginated ambientes with filters', async () => {
    const ambientes: Ambiente[] = [
      { id: 1, clienteId: 1, nombre: 'qa', path: '/proyectos/demo/qa', comandoUp: '', comandoDown: '' },
      { id: 2, clienteId: 1, nombre: 'qa2', path: '/proyectos/demo/qa2', comandoUp: '', comandoDown: '' },
    ];
    const total = 2;
    (ambienteRepository.findAndCount as jest.Mock).mockResolvedValue([ambientes, total]);

    const result = await service.findAll({ page: 1, limit: 10, nombre: 'qa', clienteId: 1 });

    expect(ambienteRepository.findAndCount).toHaveBeenCalledWith({
      where: {
        nombre: Like('%qa%'),
        clienteId: 1,
      },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      data: ambientes,
      total,
      page: 1,
      lastPage: 1,
    });
  });

  it('should return paginated ambientes without filters', async () => {
    const ambientes: Ambiente[] = [
      { id: 1, clienteId: 1, nombre: 'qa', path: '/proyectos/demo/qa', comandoUp: '', comandoDown: '' },
    ];
    const total = 1;
    (ambienteRepository.findAndCount as jest.Mock).mockResolvedValue([ambientes, total]);

    const result = await service.findAll({});

    expect(ambienteRepository.findAndCount).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      data: ambientes,
      total,
      page: 1,
      lastPage: 1,
    });
  });

  it('should return one ambiente by id', async () => {
    const ambiente: Ambiente = { id: 1, clienteId: 1, nombre: 'qa', path: '/proyectos/demo/qa', comandoUp: '', comandoDown: '' };
    (ambienteRepository.findOneBy as jest.Mock).mockResolvedValue(ambiente);

    const result = await service.findOne(1);
    expect(ambienteRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(ambiente);
  });

  it('should throw NotFoundException if ambiente not found', async () => {
    (ambienteRepository.findOneBy as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should update an ambiente', async () => {
    const dto: UpdateAmbienteDto = { nombre: 'qa2' };
    const updateResult = { affected: 1 };
    (ambienteRepository.update as jest.Mock).mockResolvedValue(updateResult);

    const result = await service.update(1, dto);
    expect(ambienteRepository.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(updateResult);
  });

  it('should throw NotFoundException if ambiente not found on update', async () => {
    const dto: UpdateAmbienteDto = { nombre: 'qa2' };
    (ambienteRepository.update as jest.Mock).mockResolvedValue({ affected: 0 });

    await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
  });

  it('should remove an ambiente (soft delete)', async () => {
    (ambienteRepository.softDelete as jest.Mock).mockResolvedValue({ affected: 1 });

    const result = await service.remove(1);
    expect(ambienteRepository.softDelete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ affected: 1 });
  });

  it('should throw NotFoundException if ambiente to remove does not exist', async () => {
    // Simula que no se eliminó ningún registro
    (ambienteRepository.softDelete as jest.Mock).mockResolvedValue({ affected: 0 });

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });

  it('should return ambientes by clienteId (paginado)', async () => {
    const ambientes: Ambiente[] = [
      { id: 1, clienteId: 1, nombre: 'qa', path: '/proyectos/demo/qa', comandoUp: '', comandoDown: '' },
    ];
    const total = 1;
    (ambienteRepository.findAndCount as jest.Mock).mockResolvedValue([ambientes, total]);

    const result = await service.findByCliente(1, {});

    expect(ambienteRepository.findAndCount).toHaveBeenCalledWith({
      where: { clienteId: 1 },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      data: ambientes,
      total,
      page: 1,
      lastPage: 1,
    });
  });

  it('should return all ambientes with deleted', async () => {
    const ambientes: Ambiente[] = [
      { id: 1, clienteId: 1, nombre: 'qa', path: '/proyectos/demo/qa', comandoUp: '', comandoDown: '', deletedAt: undefined },
      { id: 2, clienteId: 2, nombre: 'prod', path: '/proyectos/demo/prod', comandoUp: '', comandoDown: '', deletedAt: new Date() },
    ];
    (ambienteRepository.find as jest.Mock).mockResolvedValue(ambientes);

    const result = await service.findAllWithDeleted();
    expect(ambienteRepository.find).toHaveBeenCalledWith({ withDeleted: true });
    expect(result).toEqual(ambientes);
  });

  it('should return only deleted ambientes', async () => {
    const ambientes: Ambiente[] = [
      { id: 1, clienteId: 1, nombre: 'qa', path: '/proyectos/demo/qa', comandoUp: '', comandoDown: '', deletedAt: undefined },
      { id: 2, clienteId: 2, nombre: 'prod', path: '/proyectos/demo/prod', comandoUp: '', comandoDown: '', deletedAt: new Date() },
    ];
    (ambienteRepository.find as jest.Mock).mockResolvedValue(ambientes);

    const result = await service.findDeleted();
    expect(ambienteRepository.find).toHaveBeenCalledWith({ withDeleted: true });
    expect(result).toEqual(ambientes.filter(a => a.deletedAt !== undefined));
  });

  it('should return paginated ambientes by clienteId with filters', async () => {
    const ambientes: Ambiente[] = [
      { id: 1, clienteId: 2, nombre: 'qa', path: '/proyectos/demo/qa', comandoUp: '', comandoDown: '' },
      { id: 2, clienteId: 2, nombre: 'qa2', path: '/proyectos/demo/qa2', comandoUp: '', comandoDown: '' },
    ];
    const total = 2;
    const clienteId = 2;
    (ambienteRepository.findAndCount as jest.Mock).mockResolvedValue([ambientes, total]);

    const result = await service.findByCliente(clienteId, { page: 1, limit: 10, nombre: 'qa' });

    expect(ambienteRepository.findAndCount).toHaveBeenCalledWith({
      where: { clienteId, nombre: Like('%qa%') },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      data: ambientes,
      total,
      page: 1,
      lastPage: 1,
    });
  });
});
