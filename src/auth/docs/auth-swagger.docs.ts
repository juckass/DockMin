import { ApiBodyOptions, ApiResponseOptions, ApiOperationOptions } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';

export const authLoginBodyDoc: ApiBodyOptions = {
  type: LoginDto,
  description: 'Credenciales para iniciar sesión',
  examples: {
    ejemplo: {
      summary: 'Ejemplo de login',
      value: { email: 'test@example.com', password: 'password123' }
    }
  }
};

export const authLoginResponseDoc: ApiResponseOptions = {
  status: 200,
  description: 'Login exitoso. Devuelve el token JWT y datos del usuario.'
};

export const authLoginUnauthorizedDoc: ApiResponseOptions = {
  status: 401,
  description: 'Credenciales inválidas.'
};
