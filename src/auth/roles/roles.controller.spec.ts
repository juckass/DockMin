import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: Partial<Record<keyof RolesService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: RolesService, useValue: service },
      ],
    }).compile();
    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('debería crear un rol', async () => {
    (service.create as jest.Mock).mockResolvedValue({ id: 1, nombre: 'admin' });
    const result = await controller.create({ nombre: 'admin', permisos: [] });
    expect(result).toEqual({ id: 1, nombre: 'admin' });
    expect(service.create).toHaveBeenCalledWith({ nombre: 'admin', permisos: [] });
  });

  it('debería retornar todos los roles', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([{ id: 1, nombre: 'admin' }]);
    const result = await controller.findAll();
    expect(result).toEqual([{ id: 1, nombre: 'admin' }]);
  });

  it('debería retornar un rol por id', async () => {
    (service.findOne as jest.Mock).mockResolvedValue({ id: 1, nombre: 'admin' });
    const result = await controller.findOne(1);
    expect(result).toEqual({ id: 1, nombre: 'admin' });
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('debería actualizar un rol', async () => {
    (service.update as jest.Mock).mockResolvedValue({ id: 1, nombre: 'admin', permisos: [] });
    const result = await controller.update(1, { nombre: 'admin', permisos: [] });
    expect(result).toEqual({ id: 1, nombre: 'admin', permisos: [] });
    expect(service.update).toHaveBeenCalledWith(1, { nombre: 'admin', permisos: [] });
  });

  it('debería eliminar un rol', async () => {
    (service.remove as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.remove(1);
    expect(result).toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
