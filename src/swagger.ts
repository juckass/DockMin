import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('API de Usuarios')
    .setDescription('Documentación de la API para el módulo de usuarios')
    .setVersion('1.0')
    .addTag('Clientes')
    .addTag('Ambientes')
    .addTag('Docker')
    .addTag('Usuarios')
    .addBearerAuth() // <-- Agrega esto
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
