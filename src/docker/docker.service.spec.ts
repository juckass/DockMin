import { Test, TestingModule } from '@nestjs/testing';
import { DockerService } from './docker.service';
import { LoggerService } from '../core/logger/logger.service';
import { Ambiente } from '../ambientes/entities/ambiente.entity';

const ambienteMock: Ambiente = {
  id: 1,
  clienteId: 1,
  nombre: 'Test',
  path: '.',
  comandoUp: 'docker compose up -d',
  comandoDown: 'docker compose down',
};

describe('DockerService', () => {
  let service: DockerService;
  let logger: LoggerService;
  let execAsyncMock: jest.Mock;

  beforeEach(() => {
    logger = { error: jest.fn(), log: jest.fn() } as any;
    service = new DockerService(logger);
    execAsyncMock = jest.fn();
    (service as any).execAsync = execAsyncMock;
  });

  describe('isDockerRunning', () => {
    it('debe devolver true si docker info funciona', async () => {
      execAsyncMock.mockResolvedValue({ stdout: '', stderr: '' });
      expect(await service.isDockerRunning()).toBe(true);
    });
    it('debe devolver false si docker info falla', async () => {
      execAsyncMock.mockRejectedValue(new Error('fail'));
      expect(await service.isDockerRunning()).toBe(false);
    });
  });

  describe('hasDockerPermissions', () => {
    it('debe devolver true si docker ps funciona', async () => {
      execAsyncMock.mockResolvedValue({ stdout: '', stderr: '' });
      expect(await service.hasDockerPermissions()).toBe(true);
    });
    it('debe devolver false si docker ps da permission denied', async () => {
      execAsyncMock.mockRejectedValue({ stderr: 'permission denied' });
      expect(await service.hasDockerPermissions()).toBe(false);
    });
    it('debe devolver false si docker ps falla por otro motivo', async () => {
      execAsyncMock.mockRejectedValue({ stderr: 'otro error' });
      expect(await service.hasDockerPermissions()).toBe(false);
    });
  });

  describe('getDockerVersion', () => {
    it('debe devolver la versión si el comando funciona', async () => {
      execAsyncMock.mockResolvedValue({ stdout: 'Docker version 24.0.2, build cb74dfc\n' });
      expect(await service.getDockerVersion()).toBe('Docker version 24.0.2, build cb74dfc');
    });
    it('debe devolver null si falla', async () => {
      execAsyncMock.mockRejectedValue(new Error('fail'));
      expect(await service.getDockerVersion()).toBeNull();
    });
  });

  describe('runAmbienteCommand', () => {
    it('debe devolver success true si el comando funciona', async () => {
      execAsyncMock.mockResolvedValue({ stdout: 'ok', stderr: '' });
      const result = await (service as any).runAmbienteCommand(ambienteMock, 'comandoUp');
      expect(result).toEqual({ success: true, stdout: 'ok', stderr: '' });
    });
    it('debe devolver success false y loguear si el comando falla', async () => {
      execAsyncMock.mockRejectedValue({ message: 'fail', stdout: '', stderr: 'err', stack: 'trace' });
      const result = await (service as any).runAmbienteCommand(ambienteMock, 'comandoUp');
      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('upAmbiente/downAmbiente/psAmbiente', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'runAmbienteCommand').mockResolvedValue({ success: true, stdout: 'ok', stderr: '' });
    });
    it('upAmbiente llama runAmbienteCommand con comandoUp', async () => {
      await service.upAmbiente(ambienteMock);
      expect((service as any).runAmbienteCommand).toHaveBeenCalledWith(ambienteMock, 'comandoUp');
    });
    it('downAmbiente llama runAmbienteCommand con comandoDown', async () => {
      await service.downAmbiente(ambienteMock);
      expect((service as any).runAmbienteCommand).toHaveBeenCalledWith(ambienteMock, 'comandoDown');
    });
    it('psAmbiente llama runAmbienteCommand con docker compose ps', async () => {
      await service.psAmbiente(ambienteMock);
      expect((service as any).runAmbienteCommand).toHaveBeenCalledWith(ambienteMock, 'docker compose ps');
    });
  });
});
