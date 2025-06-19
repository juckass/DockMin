import { Test, TestingModule } from '@nestjs/testing';
import { AmbientesController } from './ambientes.controller';
import { AmbientesService } from './ambientes.service';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';
import { Like } from 'typeorm';
import { Ambiente } from './entities/ambiente.entity';
import { ClientesService } from '../clientes/clientes.service'; // importa el servicio real o ajusta el path

describe('AmbientesController', () => {
  let controller: AmbientesController;
  let service: AmbientesService;

  const mockAmbientesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByCliente: jest.fn(),
    findDeletedByCliente: jest.fn(),
  };

  const mockClientesService = {
    // puedes dejarlo vacío si no lo usas en estos tests
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmbientesController],
      providers: [
        {
          provide: AmbientesService,
          useValue: mockAmbientesService,
        },
        {
          provide: ClientesService,
          useValue: mockClientesService,
        },
      ],
    }).compile();

    controller = module.get<AmbientesController>(AmbientesController);
    service = module.get<AmbientesService>(AmbientesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an ambiente', async () => {
    const dto: CreateAmbienteDto = {
      clienteId: 1,
      nombre: 'qa',
      path: '/proyectos/sura/qa',
      comandoUp: 'docker compose up -d',
      comandoDown: 'docker compose down',
    };
    const result = { id: 1, ...dto };
    mockAmbientesService.create.mockResolvedValue(result);

    expect(await controller.create(dto)).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all ambientes', async () => {
    const result = [
      { id: 1, clienteId: 1, nombre: 'qa', path: '/proyectos/sura/qa', comandoUp: '', comandoDown: '' },
    ];
    mockAmbientesService.findAll.mockResolvedValue(result);

    expect(await controller.findAll()).toEqual(result);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one ambiente by id', async () => {
    const result = { id: 1, clienteId: 1, nombre: 'qa', path: '/proyectos/sura/qa', comandoUp: '', comandoDown: '' };
    mockAmbientesService.findOne.mockResolvedValue(result);

    expect(await controller.findOne(1)).toEqual(result);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update an ambiente', async () => {
    const dto: UpdateAmbienteDto = { nombre: 'qa2' };
    const result = { affected: 1 };
    mockAmbientesService.update.mockResolvedValue(result);

    expect(await controller.update(1, dto)).toEqual(result);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove an ambiente', async () => {
    const result = { affected: 1 };
    mockAmbientesService.remove.mockResolvedValue(result);

    expect(await controller.remove(1)).toEqual(result);
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should listar ambientes por cliente (paginado)', async () => {
    const ambientes: Ambiente[] = [
      { id: 1, clienteId: 2, nombre: 'qa', path: '/proyectos/demo/qa', comandoUp: '', comandoDown: '' },
      { id: 2, clienteId: 2, nombre: 'qa2', path: '/proyectos/demo/qa2', comandoUp: '', comandoDown: '' },
    ];
    const paginatedResult = {
      data: ambientes,
      total: 2,
      page: 1,
      lastPage: 1,
    };
    mockAmbientesService.findByCliente.mockResolvedValue(paginatedResult);

    const result = await controller.findByCliente(2, 1, 10, 'qa');

    expect(service.findByCliente).toHaveBeenCalledWith(2, { page: 1, limit: 10, nombre: 'qa' });
    expect(result).toEqual(paginatedResult);
  });

  it('should return deleted ambientes by clienteId', async () => {
    const deletedAmbientes = [
      { id: 2, clienteId: 1, nombre: 'qa', deletedAt: new Date() },
    ];
    mockAmbientesService.findDeletedByCliente.mockResolvedValue(deletedAmbientes);

    const result = await controller.findDeletedAmbientes(1);
    expect(service.findDeletedByCliente).toHaveBeenCalledWith(1);
    expect(result).toEqual(deletedAmbientes);
  });
});
