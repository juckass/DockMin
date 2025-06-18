import { Test, TestingModule } from '@nestjs/testing';
import { AmbientesController } from './ambientes.controller';
import { AmbientesService } from './ambientes.service';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';

describe('AmbientesController', () => {
  let controller: AmbientesController;
  let service: AmbientesService;

  const mockAmbientesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmbientesController],
      providers: [
        {
          provide: AmbientesService,
          useValue: mockAmbientesService,
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
});
