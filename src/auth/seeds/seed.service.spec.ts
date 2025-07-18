import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { RolesService } from '../roles/roles.service';
import { PermissionsService } from '../permissions/permissions.service';
import { UsuariosService } from '../../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';

describe('SeedService', () => {
  let service: SeedService;
  let rolesService: Partial<Record<keyof RolesService, jest.Mock>>;
  let permissionsService: Partial<Record<keyof PermissionsService, jest.Mock>>;
  let usuariosService: Partial<Record<keyof UsuariosService, jest.Mock>>;

  beforeEach(async () => {
    rolesService = {
      createIfNotExists: jest.fn(),
    };
    permissionsService = {};
    usuariosService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: RolesService, useValue: rolesService },
        { provide: PermissionsService, useValue: permissionsService },
        { provide: UsuariosService, useValue: usuariosService },
      ],
    }).compile();
    service = module.get<SeedService>(SeedService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  
  it('no crea usuario admin si ya existe', async () => {
    (rolesService.createIfNotExists as jest.Mock).mockResolvedValue({ id: 1, nombre: 'admin' });
    (usuariosService.findByEmail as jest.Mock).mockResolvedValue({ id: 10, email: 'admin@dockmin.com' });
    await service.runSeed();
    expect(usuariosService.create).not.toHaveBeenCalled();
  });
});
