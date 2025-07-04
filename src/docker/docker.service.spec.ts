import { Test, TestingModule } from '@nestjs/testing';
import { DockerService } from './docker.service';
import { LoggerService } from '../core/logger/logger.service';
import { Ambiente } from '../ambientes/entities/ambiente.entity';
import { ConfigService } from '@nestjs/config';

const ambienteMock: Ambiente = {
  id: 1,
  clienteId: 1,
  nombre: 'Test',
  path: 'proyecto1',
  comandoUp: 'docker compose up -d',
  comandoDown: 'docker compose down',
};

describe('DockerService', () => {
  let service: DockerService;
  let logger: LoggerService;
  let execAsyncMock: jest.Mock;
  let configService: ConfigService;

  beforeEach(() => {
    logger = { error: jest.fn(), log: jest.fn() } as any;
    configService = { get: jest.fn((key) => key === 'AMBIENTES_BASE_PATH' ? '/base/dir' : undefined) } as any;
    service = new DockerService(logger, configService);
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
    it('debe devolver success true si el comando funciona y el path es válido', async () => {
      execAsyncMock.mockResolvedValue({ stdout: 'ok', stderr: '' });
      const result = await (service as any).runAmbienteCommand(ambienteMock, 'comandoUp');
      expect(result).toEqual({ success: true, stdout: 'ok', stderr: '' });
    });
    it('debe lanzar error si el path está fuera de la base', async () => {
      const ambienteMalicioso = { ...ambienteMock, path: '../../etc' };
      await expect((service as any).runAmbienteCommand(ambienteMalicioso, 'comandoUp')).resolves.toMatchObject({
        success: false,
        error: expect.stringContaining('directorio permitido'),
      });
      expect(logger.error).toHaveBeenCalled();
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

  describe('isCommandSafe', () => {
    it('permite docker compose up -d', () => {
      expect((service as any).isCommandSafe('docker compose up -d')).toBe(true);
    });
    it('permite docker compose down', () => {
      expect((service as any).isCommandSafe('docker compose down')).toBe(true);
    });
    it('permite docker compose ps', () => {
      expect((service as any).isCommandSafe('docker compose ps')).toBe(true);
    });
    it('rechaza comandos con ;', () => {
      expect((service as any).isCommandSafe('docker compose up ; rm -rf /')).toBe(false);
    });
    it('rechaza comandos con &&', () => {
      expect((service as any).isCommandSafe('docker compose up && echo hack')).toBe(false);
    });
    it('rechaza comandos con |', () => {
      expect((service as any).isCommandSafe('docker compose up | cat')).toBe(false);
    });
    it('rechaza comandos con $', () => {
      expect((service as any).isCommandSafe('docker compose up $HOME')).toBe(false);
    });
    it('rechaza comandos que no sean docker compose', () => {
      expect((service as any).isCommandSafe('ls -la')).toBe(false);
      expect((service as any).isCommandSafe('rm -rf /')).toBe(false);
    });
    it('rechaza docker run', () => {
      expect((service as any).isCommandSafe('docker run -it bash')).toBe(false);
    });
    it('permite docker compose up --profile=nginx -d', () => {
      expect((service as any).isCommandSafe('docker compose --profile=nginx up -d')).toBe(true);
    });
    it('rechaza docker compose up con backticks', () => {
      expect((service as any).isCommandSafe('docker compose up `rm -rf /`')).toBe(false);
    });
  });
});
