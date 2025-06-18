import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClienteDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString({ message: 'El slug debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El slug es requerido' })
  slug: string;
}