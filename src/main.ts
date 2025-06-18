import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AllExceptionsFilter } from './core/filters/all-exceptions/all-exceptions.filter';
import { LoggerService } from './core/logger/logger.service';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);


    // Activa la validación global
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma payloads a los tipos de los DTOs
    }));

    
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Dockmin API')
    .setDescription('Documentación de la API de Dockmin')
    .setVersion('1.0')
    .addTag('Clientes')
    .addTag('Ambientes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Inyecta el logger y registra el filtro global
  const logger = app.get(LoggerService);
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
