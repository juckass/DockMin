import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { Usuario } from '../../src/usuarios/entities/usuario.entity';

describe('Usuarios Módulo (Integración)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [Usuario],
      synchronize: true,
      dropSchema: true,
    });
    await dataSource.initialize();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const usuarioRepository = dataSource.getRepository(Usuario);
    await usuarioRepository.clear();

    const usuario = {
      correo: 'test@example.com',
      nombreCompleto: 'Test User',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/usuarios')
      .send(usuario)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe('number');
  });

  it('debería crear un usuario', async () => {
    const usuario = {
      correo: 'test2@example.com',
      nombreCompleto: 'Test User 2',
      password: 'password123',
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
    // Crear un usuario primero
    const usuario = {
      correo: 'obtenerid@example.com',
      nombreCompleto: 'Obtener ID User',
      password: 'password123',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/usuarios')
      .send(usuario)
      .expect(201);

    const userId = createResponse.body.id;

    const response = await request(app.getHttpServer())
      .get(`/usuarios/${userId}`)
      .expect(200);

    expect(response.body).toHaveProperty('correo');
    expect(response.body).toHaveProperty('nombreCompleto');
    expect(response.body.correo).toBe(usuario.correo);
    expect(response.body.nombreCompleto).toBe(usuario.nombreCompleto);
  });

  it('debería actualizar un usuario', async () => {
    // Crear un usuario primero
    const usuario = {
      correo: 'updateuser@example.com',
      nombreCompleto: 'User To Update',
      password: 'password123',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/usuarios')
      .send(usuario)
      .expect(201);

    const userId = createResponse.body.id;

    const updateData = {
      nombreCompleto: 'Updated User',
    };

    const response = await request(app.getHttpServer())
      .patch(`/usuarios/${userId}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toMatchObject(updateData);
  });

  it('debería eliminar un usuario y devolver el usuario eliminado', async () => {
    // Crear un usuario primero
    const usuario = {
      correo: 'deleteuser@example.com',
      nombreCompleto: 'User To Delete',
      password: 'password123',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/usuarios')
      .send(usuario)
      .expect(201);

    const userId = createResponse.body.id;

    const response = await request(app.getHttpServer())
      .delete(`/usuarios/${userId}`)
      .expect(200);

    expect(response.body).toEqual({
      message: 'Usuario eliminado correctamente',
      usuario: {
        id: userId,
        correo: usuario.correo,
        nombreCompleto: usuario.nombreCompleto,
        rol: 'user',
        deletedAt: expect.any(String),
      },
    });
  });
});
