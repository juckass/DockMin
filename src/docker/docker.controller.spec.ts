import { Test, TestingModule } from '@nestjs/testing';
import { DockerController } from './docker.controller';
import { DockerService } from './docker.service';
import { AmbientesService } from '../ambientes/ambientes.service';
import { NotFoundException } from '@nestjs/common';

describe('DockerController', () => {
  let controller: DockerController;
  let dockerService: jest.Mocked<DockerService>;
  let ambientesService: jest.Mocked<AmbientesService>;

  beforeEach(async () => {
    dockerService = {
      isDockerRunning: jest.fn().mockResolvedValue(true),
      hasDockerPermissions: jest.fn().mockResolvedValue(true),
      getDockerVersion: jest.fn().mockResolvedValue('Docker version 24.0.2, build cb74dfc'),
      upAmbiente: jest.fn().mockResolvedValue({ success: true, stdout: 'up', stderr: '', error: null }),
      downAmbiente: jest.fn().mockResolvedValue({ success: true, stdout: 'down', stderr: '', error: null }),
      psAmbiente: jest.fn().mockResolvedValue({ success: true, stdout: 'ps', stderr: '', error: null }),
    } as any;
    ambientesService = {
      findOne: jest.fn((id) => id === 1 ? { id: 1, nombre: 'Test', path: '.', comandoUp: 'up', comandoDown: 'down' } : null),
    } as any;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DockerController],
      providers: [
        { provide: DockerService, useValue: dockerService },
        { provide: AmbientesService, useValue: ambientesService },
      ],
    }).compile();
    controller = module.get<DockerController>(DockerController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('getDockerStatus debe devolver el estado', async () => {
    const result = await controller.getDockerStatus();
    expect(result).toEqual({
      running: true,
      hasPermissions: true,
      dockerVersion: 'Docker version 24.0.2, build cb74dfc',
      timestamp: expect.any(String),
    });
    expect(dockerService.isDockerRunning).toHaveBeenCalled();
    expect(dockerService.hasDockerPermissions).toHaveBeenCalled();
    expect(dockerService.getDockerVersion).toHaveBeenCalled();
  });

  describe('upAmbiente', () => {
    it('debe levantar el ambiente', async () => {
      const result = await controller.upAmbiente(1);
      expect(result).toEqual({ success: true, stdout: 'up', stderr: '', error: null });
      expect(dockerService.upAmbiente).toHaveBeenCalledWith({ id: 1, nombre: 'Test', path: '.', comandoUp: 'up', comandoDown: 'down' });
    });
    it('debe lanzar NotFoundException si no existe', async () => {
      await expect(controller.upAmbiente(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('downAmbiente', () => {
    it('debe bajar el ambiente', async () => {
      const result = await controller.downAmbiente(1);
      expect(result).toEqual({ success: true, stdout: 'down', stderr: '', error: null });
      expect(dockerService.downAmbiente).toHaveBeenCalledWith({ id: 1, nombre: 'Test', path: '.', comandoUp: 'up', comandoDown: 'down' });
    });
    it('debe lanzar NotFoundException si no existe', async () => {
      await expect(controller.downAmbiente(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('psAmbiente', () => {
    it('debe mostrar el estado de los contenedores', async () => {
      const result = await controller.psAmbiente(1);
      expect(result).toEqual({ success: true, stdout: 'ps', stderr: '', error: null });
      expect(dockerService.psAmbiente).toHaveBeenCalledWith({ id: 1, nombre: 'Test', path: '.', comandoUp: 'up', comandoDown: 'down' });
    });
    it('debe lanzar NotFoundException si no existe', async () => {
      await expect(controller.psAmbiente(999)).rejects.toThrow(NotFoundException);
    });
  });
});
