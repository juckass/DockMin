import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepository } from 'typeorm';
import { Usuario } from '../../src/usuarios/entities/usuario/usuario';

describe('Usuarios Módulo (Integración)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const usuarioRepository = getRepository(Usuario);
    await usuarioRepository.clear();

    const usuario = {
      correo: 'test@example.com',
      nombreCompleto: 'Test User',
      contraseña: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/usuarios')
      .send(usuario)
      .expect(201);

    expect(response.body).toHaveProperty('id', 1);
  });

  it('debería crear un usuario', async () => {
    const usuario = {
      correo: 'test2@example.com',
      nombreCompleto: 'Test User 2',
      contraseña: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/usuarios')
      .send(usuario)
      .expect(201);

    expect(response.body).toMatchObject({
      correo: usuario.correo,
      nombreCompleto: usuario.nombreCompleto,
    });
  });

  it('debería obtener todos los usuarios', async () => {
    const response = await request(app.getHttpServer())
      .get('/usuarios')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('debería obtener un usuario por ID', async () => {
    const response = await request(app.getHttpServer())
      .get('/usuarios/1')
      .expect(200);

    expect(response.body).toHaveProperty('correo');
    expect(response.body).toHaveProperty('nombreCompleto');
  });

  it('debería actualizar un usuario', async () => {
    const updateData = {
      nombreCompleto: 'Updated User',
    };

    const response = await request(app.getHttpServer())
      .patch('/usuarios/1')
      .send(updateData)
      .expect(200);

    expect(response.body).toMatchObject(updateData);
  });

  it('debería eliminar un usuario', async () => {
    const response = await request(app.getHttpServer())
      .delete('/usuarios/1')
      .expect(200);

    expect(response.body).toEqual({ message: 'Usuario eliminado correctamente' });
  });
});
