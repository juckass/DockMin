import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: Partial<Record<keyof PermissionsService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        { provide: PermissionsService, useValue: service },
      ],
    }).compile();
    controller = module.get<PermissionsController>(PermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('debería retornar todos los permisos', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([{ id: 1, nombre: 'permiso' }]);
    const result = await controller.findAll();
    expect(result).toEqual([{ id: 1, nombre: 'permiso' }]);
  });

  it('debería retornar un permiso por id', async () => {
    (service.findOne as jest.Mock).mockResolvedValue({ id: 1, nombre: 'permiso' });
    const result = await controller.findOne(1);
    expect(result).toEqual({ id: 1, nombre: 'permiso' });
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('debería actualizar solo la descripción de un permiso', async () => {
    (service.update as jest.Mock).mockResolvedValue({ id: 1, nombre: 'permiso', descripcion: 'nueva' });
    const result = await controller.update(1, { nombre: 'no', descripcion: 'nueva' });
    expect(result).toEqual({ id: 1, nombre: 'permiso', descripcion: 'nueva' });
    expect(service.update).toHaveBeenCalledWith(1, { descripcion: 'nueva' });
  });

  it('debería eliminar un permiso', async () => {
    (service.remove as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.remove(1);
    expect(result).toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
