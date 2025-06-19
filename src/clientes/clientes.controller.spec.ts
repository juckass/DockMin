import { Test, TestingModule } from '@nestjs/testing';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

describe('ClientesController', () => {
  let controller: ClientesController;
  let service: ClientesService;

  const mockClientesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [
        {
          provide: ClientesService,
          useValue: mockClientesService,
        },
      ],
    }).compile();

    controller = module.get<ClientesController>(ClientesController);
    service = module.get<ClientesService>(ClientesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a cliente', async () => {
    const dto: CreateClienteDto = { nombre: 'Test' };
    const result = { id: 1, nombre: 'Test', slug: 'test' };
    mockClientesService.create.mockResolvedValue(result);

    expect(await controller.create(dto)).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all clientes', async () => {
    const result = [{ id: 1, nombre: 'Test', slug: 'test' }];
    mockClientesService.findAll.mockResolvedValue(result);

    expect(await controller.findAll()).toEqual(result);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one cliente by id', async () => {
    const result = { id: 1, nombre: 'Test', slug: 'test' };
    mockClientesService.findOne.mockResolvedValue(result);

    expect(await controller.findOne(1)).toEqual(result);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a cliente', async () => {
    const updateDto = { nombre: 'NuevoNombre' };
    const updatedCliente = { id: 1, nombre: 'NuevoNombre' };
    mockClientesService.update = jest.fn().mockResolvedValue(updatedCliente);

    const result = await controller.update(1, updateDto);

    expect(service.update).toHaveBeenCalledWith(1, updateDto);
    expect(result).toEqual(updatedCliente);
  });

  it('should remove a cliente', async () => {
    mockClientesService.remove.mockResolvedValue({ id: 1, nombre: 'DemoCorp' });

    const result = await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, nombre: 'DemoCorp' });
  });
});