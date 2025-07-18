import { Test, TestingModule } from '@nestjs/testing';
import { PermissionSyncService } from './permission-sync.service';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { PermissionsService } from './permissions/permissions.service';
import { RolesService } from './roles/roles.service';

describe('PermissionSyncService', () => {
  let service: PermissionSyncService;
  let discoveryService: Partial<Record<keyof DiscoveryService, jest.Mock>>;
  let permissionsService: Partial<Record<keyof PermissionsService, jest.Mock>>;
  let rolesService: Partial<Record<keyof RolesService, jest.Mock>>;

  beforeEach(async () => {
    discoveryService = {
      controllerMethodsWithMetaAtKey: jest.fn(),
    };
    permissionsService = {
      createIfNotExists: jest.fn(),
      findAll: jest.fn(),
      remove: jest.fn(),
    };
    rolesService = {
      findAll: jest.fn(),
      update: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionSyncService,
        { provide: DiscoveryService, useValue: discoveryService },
        { provide: PermissionsService, useValue: permissionsService },
        { provide: RolesService, useValue: rolesService },
      ],
    }).compile();
    service = module.get<PermissionSyncService>(PermissionSyncService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sincroniza permisos nuevos y elimina huérfanos si la variable está activa', async () => {
    (discoveryService.controllerMethodsWithMetaAtKey as jest.Mock).mockResolvedValue([
      { meta: 'permiso.1' },
      { meta: 'permiso.2' },
    ]);
    (permissionsService.findAll as jest.Mock).mockResolvedValue([
      { id: 1, nombre: 'permiso.1' },
      { id: 2, nombre: 'permiso.huérfano' },
    ]);
    (rolesService.findAll as jest.Mock).mockResolvedValue([
      { id: 1, nombre: 'admin', permisos: [{ id: 2, nombre: 'permiso.huérfano' }] },
      { id: 2, nombre: 'user', permisos: [] },
    ]);
    process.env.PERMISSIONS_DELETE_ORPHANS = 'true';
    await service.syncPermissions();
    expect(permissionsService.createIfNotExists).toHaveBeenCalledWith({ nombre: 'permiso.1', descripcion: expect.any(String) });
    expect(permissionsService.createIfNotExists).toHaveBeenCalledWith({ nombre: 'permiso.2', descripcion: expect.any(String) });
    expect(rolesService.update).toHaveBeenCalledWith(1, { permisos: [] });
    expect(permissionsService.remove).toHaveBeenCalledWith(2);
  });

  it('no elimina huérfanos si la variable no está activa', async () => {
    (discoveryService.controllerMethodsWithMetaAtKey as jest.Mock).mockResolvedValue([
      { meta: 'permiso.1' },
    ]);
    (permissionsService.findAll as jest.Mock).mockResolvedValue([
      { id: 2, nombre: 'permiso.huérfano' },
    ]);
    (rolesService.findAll as jest.Mock).mockResolvedValue([
      { id: 1, nombre: 'admin', permisos: [{ id: 2, nombre: 'permiso.huérfano' }] },
    ]);
    process.env.PERMISSIONS_DELETE_ORPHANS = 'false';
    await service.syncPermissions();
    expect(permissionsService.remove).not.toHaveBeenCalled();
    expect(rolesService.update).not.toHaveBeenCalled();
  });
});
