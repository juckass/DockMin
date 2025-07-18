import { Test, TestingModule } from '@nestjs/testing';
import { DiscoverySyncService } from './discovery-sync.service';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { PermissionsService } from './permissions/permissions.service';

const mockDiscoveryService = {
  providerMethodsWithMetaAtKey: jest.fn(),
};
const mockPermissionsService = {
  createIfNotExists: jest.fn(),
};

describe('DiscoverySyncService', () => {
  let service: DiscoverySyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoverySyncService,
        { provide: DiscoveryService, useValue: mockDiscoveryService },
        { provide: PermissionsService, useValue: mockPermissionsService },
      ],
    }).compile();
    service = module.get<DiscoverySyncService>(DiscoverySyncService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debería sincronizar permisos detectados', async () => {
    mockDiscoveryService.providerMethodsWithMetaAtKey.mockResolvedValue([
      { meta: 'permiso.1' },
      { meta: 'permiso.2' },
      { meta: 'permiso.1' }, // duplicado
    ]);
    mockPermissionsService.createIfNotExists.mockResolvedValue({});
    await service.syncPermissions();
    expect(mockDiscoveryService.providerMethodsWithMetaAtKey).toHaveBeenCalled();
    expect(mockPermissionsService.createIfNotExists).toHaveBeenCalledTimes(2);
    expect(mockPermissionsService.createIfNotExists).toHaveBeenCalledWith({ nombre: 'permiso.1', descripcion: expect.any(String) });
    expect(mockPermissionsService.createIfNotExists).toHaveBeenCalledWith({ nombre: 'permiso.2', descripcion: expect.any(String) });
  });
});
