import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { SeedService } from '../../src/auth/seeds/seed.service';
import * as request from 'supertest';

describe('Auth - Integración', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    // Inicializa la app 
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

   

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Ejecuta el seed
    const seedService = app.get(SeedService);
    await seedService.runSeed();

    // Opcional: Verifica que el usuario de prueba existe
    // const userRepo = app.get(DataSource).getRepository('User');
    // const user = await userRepo.findOneBy({ email: 'admin@dockmin.com' });
    // expect(user).toBeDefined();
    
  });

  it('debe hacer login correctamente', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@dockmin.com', password: 'admin123' });

    // Debug: log response if test fails
    if (!res.body.access_token) {
      // eslint-disable-next-line no-console
      console.error('Login response:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    // Si tu API no retorna user, puedes quitar la siguiente línea
    // expect(res.body.user.email).toBe('admin@dockmin.com');
    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;
  });

  it('debe renovar el accessToken con refreshToken válido', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken });
    if (!res.body.access_token) {
      // eslint-disable-next-line no-console
      console.error('Refresh response:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;
  });

  it('debe cerrar sesión (logout) correctamente', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    if (!res.body.message) {
      // eslint-disable-next-line no-console
      console.error('Logout response:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout exitoso');
  });

  it('debe rechazar login con credenciales inválidas', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@dockmin.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/credenciales/i);
  });

  it('debe rechazar refresh con refreshToken inválido', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'token-invalido' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/refresh token/i);
  });
});
