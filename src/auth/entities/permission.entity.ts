
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad Permission
 *
 * Representa un permiso del sistema, utilizado para el control de acceso granular (RBAC).
 *
 * Ejemplo de uso:
 * {
 *   "id": 1,
 *   "nombre": "crear_cliente",
 *   "descripcion": "Permite crear clientes"
 * }
 */
@Entity()
export class Permission {
  @ApiProperty({
    example: 1,
    description: 'Identificador único y autoincremental del permiso.'
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'crear_cliente',
    description: 'Nombre único del permiso. Usar snake_case. Ejemplo: crear_cliente, borrar_ambiente.'
  })
  @Column({ unique: true })
  nombre: string;

  @ApiProperty({
    example: 'Permite crear clientes',
    required: false,
    description: 'Descripción opcional y legible del permiso.'
  })
  @Column({ nullable: true })
  descripcion: string;
}