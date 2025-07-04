import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

describe('Dockmin API (integración)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    // Obtener el DataSource y sincronizar la base de datos
    dataSource = app.get(DataSource);
    await dataSource.synchronize(true);

    // Crear carpetas necesarias para los tests de ambientes
    const basePath = process.env.AMBIENTES_BASE_PATH || '/proyectos';
    const ambientes = ['qa', 'qa-docker'];
    for (const amb of ambientes) {
      const dir = path.resolve(basePath, amb);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
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
        path: 'qa',
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

  it('Consulta el estado general de Docker', async () => {
    const res = await request(app.getHttpServer())
      .get('/docker/status')
      .expect(200);
    expect(res.body).toHaveProperty('running');
    expect(res.body).toHaveProperty('dockerVersion');
    expect(res.body).toHaveProperty('hasPermissions');
  });

  it('Levanta, consulta y baja un ambiente con Docker', async () => {
    // Crea un cliente específico para este test
    const clienteRes = await request(app.getHttpServer())
      .post('/clientes')
      .send({ nombre: 'ClienteDocker' })
      .expect(201);
    const clienteDockerId = clienteRes.body.id;

    // Crea un ambiente asociado a ese cliente
    const ambienteRes = await request(app.getHttpServer())
      .post('/ambientes')
      .send({
        clienteId: clienteDockerId,
        nombre: 'qa-docker',
        path: 'qa-docker',
        comandoUp: 'docker compose up -d',
        comandoDown: 'docker compose down',
        perfiles: [],
        autostart: false,
        orden: 1
      })
      .expect(201);
    const ambienteDockerId = ambienteRes.body.id;

    // Levanta el ambiente
    const upRes = await request(app.getHttpServer())
      .post(`/docker/up/${ambienteDockerId}`)
      .expect(201); // Cambiado a 201 para reflejar el status real
    expect(upRes.body).toHaveProperty('success');

    // Consulta los contenedores del ambiente
    const psRes = await request(app.getHttpServer())
      .post(`/docker/ps/${ambienteDockerId}`)
      .expect(201); // Cambiado a 201 para reflejar el status real
    expect(psRes.body).toHaveProperty('success');

    // Baja el ambiente con Docker
    const downRes = await request(app.getHttpServer())
      .post(`/docker/down/${ambienteDockerId}`)
      .expect(201); // Cambiado a 201 para reflejar el status real
    expect(downRes.body).toHaveProperty('success');

    // Limpieza: elimina el ambiente y el cliente de prueba
    await request(app.getHttpServer())
      .delete(`/ambientes/${ambienteDockerId}`)
      .expect(200); // Devuelve 200 según el estándar REST
    await request(app.getHttpServer())
      .delete(`/clientes/${clienteDockerId}`)
      .expect(200); // Devuelve 200 según el estándar REST
  });
});