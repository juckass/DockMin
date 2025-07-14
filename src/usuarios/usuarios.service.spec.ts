import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario/usuario';

const mockUsuarioRepository = {
  findOneBy: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsuariosService', () => {
  let service: UsuariosService;

  beforeEach(async () => {
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
    it('debería crear un usuario con contraseña hasheada', async () => {
      const createUsuarioDto = {
        correo: 'test@example.com',
        nombreCompleto: 'Test User',
        contraseña: 'password123',
      };

      mockUsuarioRepository.findOneBy.mockResolvedValue(null);
      mockUsuarioRepository.create.mockImplementation((usuario) => usuario);
      mockUsuarioRepository.save.mockImplementation(async (usuario) => ({ id: 1, ...usuario }));

      const result = await service.create(createUsuarioDto);

      expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ correo: createUsuarioDto.correo });
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith({
        ...createUsuarioDto,
        contraseña: expect.any(String),
      });
      expect(mockUsuarioRepository.save).toHaveBeenCalledWith({
        ...createUsuarioDto,
        contraseña: expect.any(String),
      });
      expect(result).toEqual({
        id: 1,
        ...createUsuarioDto,
        contraseña: expect.any(String),
      });
    });

    it('debería lanzar un error si el correo ya está registrado', async () => {
      const createUsuarioDto = {
        correo: 'test@example.com',
        nombreCompleto: 'Test User',
        contraseña: 'password123',
      };

      mockUsuarioRepository.findOneBy.mockResolvedValue({ id: 1, ...createUsuarioDto });

      await expect(service.create(createUsuarioDto)).rejects.toThrow('El correo ya está registrado');
      expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ correo: createUsuarioDto.correo });
    });
  });
});
