import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const mockUsuariosService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
};

describe('UsuariosController', () => {
  let controller: UsuariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call UsuariosService.create with correct parameters', async () => {
      const createUsuarioDto: CreateUsuarioDto = {
        correo: 'test@example.com',
        nombreCompleto: 'Test User',
        password: 'password123',
      };
      mockUsuariosService.create.mockResolvedValue({ id: 1, ...createUsuarioDto });

      const result = await controller.create(createUsuarioDto);

      expect(mockUsuariosService.create).toHaveBeenCalledWith(createUsuarioDto);
      expect(result).toEqual({ id: 1, ...createUsuarioDto });
    });
  });

  describe('findAll', () => {
    it('should call UsuariosService.findAll with correct parameters', async () => {
      const query = { page: 1, limit: 10 };
      mockUsuariosService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        lastPage: 1,
      });

      const result = await controller.findAll(query);

      expect(mockUsuariosService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        lastPage: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should call UsuariosService.findOne with correct parameters', async () => {
      const id = 1;
      mockUsuariosService.findOne.mockResolvedValue({ id, correo: 'test@example.com', nombreCompleto: 'Test User' });

      const result = await controller.findOne(id);

      expect(mockUsuariosService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id, correo: 'test@example.com', nombreCompleto: 'Test User' });
    });
  });

  describe('update', () => {
    it('should call UsuariosService.update with correct parameters', async () => {
      const id = 1;
      const updateUsuarioDto: UpdateUsuarioDto = {
        nombreCompleto: 'Updated User',
      };
      mockUsuariosService.update.mockResolvedValue({ id, correo: 'test@example.com', nombreCompleto: 'Updated User' });

      const result = await controller.update(id, updateUsuarioDto);

      expect(mockUsuariosService.update).toHaveBeenCalledWith(id, updateUsuarioDto);
      expect(result).toEqual({ id, correo: 'test@example.com', nombreCompleto: 'Updated User' });
    });
  });

  describe('remove', () => {
    it('should call UsuariosService.remove with correct parameters', async () => {
      const id = 1;
      mockUsuariosService.remove.mockResolvedValue({ id, correo: 'test@example.com', nombreCompleto: 'Deleted User' });

      const result = await controller.remove(id);

      expect(mockUsuariosService.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message: 'Usuario eliminado correctamente', usuario: { id, correo: 'test@example.com', nombreCompleto: 'Deleted User' } });
    });
  });

  describe('restore', () => {
    it('should call UsuariosService.restore with correct parameters', async () => {
      const id = 1;
      mockUsuariosService.restore = jest.fn().mockResolvedValue({ id, correo: 'test@example.com', nombreCompleto: 'Restored User' });

      const result = await controller.restore(id);

      expect(mockUsuariosService.restore).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id, correo: 'test@example.com', nombreCompleto: 'Restored User' });
    });
  });
});
