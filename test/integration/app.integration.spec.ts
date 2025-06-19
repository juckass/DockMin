import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Dockmin API (integración)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let clienteId: number;
  let ambienteId: number;

  it('Crea un cliente', async () => {
    const res = await request(app.getHttpServer())
      .post('/clientes')
      .send({ nombre: 'DemoCorp' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe('DemoCorp');
    clienteId = res.body.id;
  });

  it('Crea un ambiente para ese cliente', async () => {
    const res = await request(app.getHttpServer())
      .post('/ambientes')
      .send({
        clienteId,
        nombre: 'qa',
        path: '/proyectos/demo/qa',
        comandoUp: 'docker compose up -d',
        comandoDown: 'docker compose down',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.clienteId).toBe(clienteId);
    ambienteId = res.body.id;
  });

  it('Lista ambientes por cliente', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ambientes/cliente/${clienteId}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].nombre).toBe('qa');
  });

  it('Elimina el ambiente', async () => {
    await request(app.getHttpServer())
      .delete(`/ambientes/${ambienteId}`)
      .expect(200);
  });

  it('Elimina el cliente', async () => {
    await request(app.getHttpServer())
      .delete(`/clientes/${clienteId}`)
      .expect(200);
  });
});