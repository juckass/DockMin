import { validate } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

describe('CreateUsuarioDto', () => {
  it('debería ser válido con datos correctos', async () => {
    const dto = new CreateUsuarioDto();
    dto.email = 'test@example.com';
    dto.nombreCompleto = 'Test User';
    dto.password = 'password123';
    dto.roleId = 1;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser inválido sin email', async () => {
    const dto = new CreateUsuarioDto();
    dto.nombreCompleto = 'Test User';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('debería ser inválido con password corta', async () => {
    const dto = new CreateUsuarioDto();
    dto.email = 'test@example.com';
    dto.nombreCompleto = 'Test User';
    dto.password = '123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
