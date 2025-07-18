import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: Partial<Record<keyof UsuariosService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usuariosService = {
      findByEmail: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('debería retornar el usuario si el password es correcto', async () => {
      const user = { id: 1, email: 'a@a.com', password: 'hashed' };
      (usuariosService.findByEmail as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const result = await service.validateUser('a@a.com', '1234');
      expect(result).toBe(user);
    });
    it('debería retornar null si el usuario no existe', async () => {
      (usuariosService.findByEmail as jest.Mock).mockResolvedValue(null);
      const result = await service.validateUser('no@a.com', '1234');
      expect(result).toBeNull();
    });
    it('debería retornar null si el password es incorrecto', async () => {
      const user = { id: 1, email: 'a@a.com', password: 'hashed' };
      (usuariosService.findByEmail as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      const result = await service.validateUser('a@a.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('debería retornar un access_token', async () => {
      const user = { id: 1, email: 'a@a.com', rol: 'admin' };
      (jwtService.sign as jest.Mock).mockReturnValue('token');
      const result = await service.login(user);
      expect(result).toEqual({ access_token: 'token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'a@a.com', rol: 'admin' });
    });
  });
});
