import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import { AllExceptionsFilter } from './core/filters/all-exceptions/all-exceptions.filter';
import { LoggerService } from './core/logger/logger.service';
import { setupSwagger } from './swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const node_env = configService.get<string>('NODE_ENV') || 'development';
  const port = configService.get<number>('PORT') || 3000;
    // Activa la validación global
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma payloads a los tipos de los DTOs
    }));


  setupSwagger(app);
  // Inyecta el logger y registra el filtro global
  const logger = app.get(LoggerService);
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  


  await app.listen(port);
}
bootstrap();
