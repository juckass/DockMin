import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';

const mockUsuarioRepository = {
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsuariosService', () => {
  let service: UsuariosService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un usuario con password hasheada', async () => {
      const createUsuarioDto = {
        email: 'test@example.com',
        nombreCompleto: 'Test User',
        password: 'password123',
        roleId: 1,
      };

      mockUsuarioRepository.findOneBy.mockResolvedValue(null);
      mockUsuarioRepository.create.mockImplementation((usuario) => usuario);
      mockUsuarioRepository.save.mockImplementation(async (usuario) => ({ id: 1, ...usuario, password: undefined }));
      mockUsuarioRepository.findOne.mockResolvedValue({ id: 1, ...createUsuarioDto, role: { id: 1 } });

      const result = await service.create(createUsuarioDto);

      expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ email: createUsuarioDto.email });
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: createUsuarioDto.email,
        nombreCompleto: createUsuarioDto.nombreCompleto,
        roleId: createUsuarioDto.roleId,
        password: expect.any(String),
      }));
      expect(mockUsuarioRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        email: createUsuarioDto.email,
        nombreCompleto: createUsuarioDto.nombreCompleto,
        roleId: createUsuarioDto.roleId,
        password: expect.any(String),
      }));
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        email: createUsuarioDto.email,
        nombreCompleto: createUsuarioDto.nombreCompleto,
        roleId: createUsuarioDto.roleId,
        role: { id: createUsuarioDto.roleId },
      }));
    });

    it('debería lanzar un error si el email ya está registrado', async () => {
      const createUsuarioDto = {
        email: 'test@example.com',
        nombreCompleto: 'Test User',
        password: 'password123',
        roleId: 1,
      };

      mockUsuarioRepository.findOneBy.mockResolvedValue({ id: 1, ...createUsuarioDto });

      await expect(service.create(createUsuarioDto)).rejects.toThrow('El email ya está registrado');
      expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ email: createUsuarioDto.email });
    });
  });
});
