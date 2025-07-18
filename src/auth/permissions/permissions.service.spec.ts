import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let permissionRepository: any;

  beforeEach(async () => {
    permissionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getRepositoryToken(Permission), useValue: permissionRepository },
      ],
    }).compile();
    service = module.get<PermissionsService>(PermissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debería crear un permiso', async () => {
    permissionRepository.create.mockReturnValue({ nombre: 'permiso', descripcion: 'desc' });
    permissionRepository.save.mockResolvedValue({ id: 1, nombre: 'permiso', descripcion: 'desc' });
    const result = await service.create({ nombre: 'permiso', descripcion: 'desc' });
    expect(result).toEqual({ id: 1, nombre: 'permiso', descripcion: 'desc' });
  });

  it('debería retornar todos los permisos', async () => {
    permissionRepository.find.mockResolvedValue([{ id: 1, nombre: 'permiso' }]);
    const result = await service.findAll();
    expect(result).toEqual([{ id: 1, nombre: 'permiso' }]);
  });

  it('debería retornar un permiso por id', async () => {
    permissionRepository.findOneBy.mockResolvedValue({ id: 1, nombre: 'permiso' });
    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1, nombre: 'permiso' });
  });

  it('debería actualizar un permiso', async () => {
    permissionRepository.update.mockResolvedValue({ affected: 1 });
    permissionRepository.findOneBy.mockResolvedValue({ id: 1, nombre: 'permiso', descripcion: 'nueva' });
    const result = await service.update(1, { descripcion: 'nueva' });
    expect(result).toEqual({ id: 1, nombre: 'permiso', descripcion: 'nueva' });
  });

  it('debería eliminar un permiso', async () => {
    permissionRepository.delete.mockResolvedValue({ affected: 1 });
    await service.remove(1);
    expect(permissionRepository.delete).toHaveBeenCalledWith(1);
  });

  it('debería crear un permiso si no existe', async () => {
    permissionRepository.findOne.mockResolvedValue(null);
    permissionRepository.create.mockReturnValue({ nombre: 'nuevo', descripcion: 'd' });
    permissionRepository.save.mockResolvedValue({ id: 2, nombre: 'nuevo', descripcion: 'd' });
    const result = await service.createIfNotExists({ nombre: 'nuevo', descripcion: 'd' });
    expect(result).toEqual({ id: 2, nombre: 'nuevo', descripcion: 'd' });
  });

  it('debería retornar el permiso existente en createIfNotExists', async () => {
    permissionRepository.findOne.mockResolvedValue({ id: 3, nombre: 'existente', descripcion: 'd' });
    const result = await service.createIfNotExists({ nombre: 'existente', descripcion: 'd' });
    expect(result).toEqual({ id: 3, nombre: 'existente', descripcion: 'd' });
  });
});
