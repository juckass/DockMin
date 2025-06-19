import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

describe('LoggerService', () => {
  let service: LoggerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'LOGS_PATH') return './test-logs';
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log info messages', () => {
    const spy = jest.spyOn<any, any>(service['logger'], 'info');
    service.log('Test info');
    expect(spy).toHaveBeenCalledWith('Test info');
    spy.mockRestore();
  });

  it('should log error messages', () => {
    const spy = jest.spyOn<any, any>(service['logger'], 'error');
    service.error('Test error', 'trace');
    expect(spy).toHaveBeenCalledWith('Test error | Trace: trace');
    spy.mockRestore();
  });

  it('should log warn messages', () => {
    const spy = jest.spyOn<any, any>(service['logger'], 'warn');
    service.warn('Test warn');
    expect(spy).toHaveBeenCalledWith('Test warn');
    spy.mockRestore();
  });

  it('should log debug messages', () => {
    const spy = jest.spyOn<any, any>(service['logger'], 'debug');
    service.debug?.('Test debug');
    expect(spy).toHaveBeenCalledWith('Test debug');
    spy.mockRestore();
  });

  it('should log verbose messages', () => {
    const spy = jest.spyOn<any, any>(service['logger'], 'verbose');
    service.verbose?.('Test verbose');
    expect(spy).toHaveBeenCalledWith('Test verbose');
    spy.mockRestore();
  });

  it('should create the logs folder if it does not exist', () => {
    const mockConfigService = {
      get: (key: string) => (key === 'LOGS_PATH' ? './test-logs-coverage' : undefined),
    };

    // Simulate that the folder does not exist
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

    // Load the service directly to force the constructor
    const { LoggerService } = require('./logger.service');
    new LoggerService(mockConfigService as any);

    expect(existsSyncSpy).toHaveBeenCalledWith('./test-logs-coverage');
    expect(mkdirSyncSpy).toHaveBeenCalledWith('./test-logs-coverage', { recursive: true });

    jest.restoreAllMocks();
  });

  afterAll(() => {
    const logDir = path.resolve('./test-logs');
    if (fs.existsSync(logDir)) {
      fs.rmSync(logDir, { recursive: true, force: true });
    }
  });
});
