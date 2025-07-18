import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('debería retornar el token si las credenciales son válidas', async () => {
      const loginDto = { email: 'a@a.com', password: '1234' };
      const user = { id: 1, email: 'a@a.com', rol: 'admin' };
      (authService.validateUser as jest.Mock).mockResolvedValue(user);
      (authService.login as jest.Mock).mockResolvedValue({ access_token: 'token' });
      const result = await controller.login(loginDto);
      expect(result).toEqual({ access_token: 'token' });
      expect(authService.validateUser).toHaveBeenCalledWith('a@a.com', '1234');
      expect(authService.login).toHaveBeenCalledWith(user);
    });
    it('debería lanzar UnauthorizedException si las credenciales son inválidas', async () => {
      const loginDto = { email: 'a@a.com', password: 'wrong' };
      (authService.validateUser as jest.Mock).mockResolvedValue(null);
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
