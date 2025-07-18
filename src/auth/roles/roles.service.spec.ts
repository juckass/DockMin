import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: any;
  let permissionRepository: any;

  beforeEach(async () => {
    roleRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    permissionRepository = {
      findByIds: jest.fn(),
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        { provide: getRepositoryToken(Permission), useValue: permissionRepository },
      ],
    }).compile();
    service = module.get<RolesService>(RolesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debería crear un rol', async () => {
    permissionRepository.findByIds.mockResolvedValue([{ id: 1 }]);
    roleRepository.create.mockReturnValue({ nombre: 'admin', permisos: [{ id: 1 }] });
    roleRepository.save.mockResolvedValue({ id: 1, nombre: 'admin', permisos: [{ id: 1 }] });
    const result = await service.create({ nombre: 'admin', permisos: [1] });
    expect(result).toEqual({ id: 1, nombre: 'admin', permisos: [{ id: 1 }] });
  });

  it('debería retornar todos los roles', async () => {
    roleRepository.find.mockResolvedValue([{ id: 1, nombre: 'admin' }]);
    const result = await service.findAll();
    expect(result).toEqual([{ id: 1, nombre: 'admin' }]);
  });

  it('debería retornar un rol por id', async () => {
    roleRepository.findOne.mockResolvedValue({ id: 1, nombre: 'admin' });
    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1, nombre: 'admin' });
  });

  it('debería actualizar un rol', async () => {
    const role = { id: 1, nombre: 'admin', permisos: [] };
    roleRepository.findOne.mockResolvedValue(role);
    permissionRepository.findByIds.mockResolvedValue([{ id: 2 }]);
    roleRepository.save.mockResolvedValue({ ...role, nombre: 'admin', permisos: [{ id: 2 }] });
    const result = await service.update(1, { nombre: 'admin', permisos: [2] });
    expect(result).toEqual({ id: 1, nombre: 'admin', permisos: [{ id: 2 }] });
  });

  it('debería eliminar un rol', async () => {
    roleRepository.delete.mockResolvedValue({ affected: 1 });
    await service.remove(1);
    expect(roleRepository.delete).toHaveBeenCalledWith(1);
  });

  it('debería crear un rol si no existe', async () => {
    roleRepository.findOne.mockResolvedValue(null);
    permissionRepository.findByIds.mockResolvedValue([]);
    roleRepository.create.mockReturnValue({ nombre: 'nuevo', permisos: [] });
    roleRepository.save.mockResolvedValue({ id: 2, nombre: 'nuevo', permisos: [] });
    const result = await service.createIfNotExists({ nombre: 'nuevo', permisos: [] });
    expect(result).toEqual({ id: 2, nombre: 'nuevo', permisos: [] });
  });

  it('debería retornar el rol existente en createIfNotExists', async () => {
    roleRepository.findOne.mockResolvedValue({ id: 3, nombre: 'existente', permisos: [] });
    const result = await service.createIfNotExists({ nombre: 'existente', permisos: [] });
    expect(result).toEqual({ id: 3, nombre: 'existente', permisos: [] });
  });
});
