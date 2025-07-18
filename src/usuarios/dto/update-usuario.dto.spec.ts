import { validate } from 'class-validator';
import { UpdateUsuarioDto } from './update-usuario.dto';

describe('UpdateUsuarioDto', () => {
  it('debería ser válido con datos opcionales correctos', async () => {
    const dto = new UpdateUsuarioDto();
    dto.email = 'updated@example.com';
    dto.nombreCompleto = 'Updated User';
    dto.password = 'newpassword123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser válido sin datos opcionales', async () => {
    const dto = new UpdateUsuarioDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser inválido con email incorrecto', async () => {
    const dto = new UpdateUsuarioDto();
    dto.email = 'not-an-email';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });
});
