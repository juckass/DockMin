import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const logsPath = this.configService.get<string>('LOGS_PATH') || './logs';

    // Asegura que la carpeta exista
    if (!fs.existsSync(logsPath)) {
      fs.mkdirSync(logsPath, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(logsPath, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logsPath, 'combined.log') }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message} ${trace ? '| Trace: ' + trace : ''}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug?(message: string) {
    this.logger.debug(message);
  }

  verbose?(message: string) {
    this.logger.verbose(message);
  }
}