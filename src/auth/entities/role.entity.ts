
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad Role
 *
 * Representa un rol del sistema, utilizado para agrupar permisos y controlar el acceso (RBAC).
 *
 * Ejemplo de uso:
 * ```json
 * {
 *   "id": 1,
 *   "nombre": "admin",
 *   "permisos": [
 *     { "id": 1, "nombre": "permissions.update", "descripcion": "Permite actualizar permisos" },
 *     { "id": 2, "nombre": "permissions.remove", "descripcion": "Permite borrar permisos" }
 *   ]
 * }
 * ```
 */
@Entity()
export class Role {
  @ApiProperty({
    example: 1,
    description: 'Identificador único y autoincremental del rol.'
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'admin',
    description: 'Nombre único del rol. Ejemplo: admin, user.'
  })
  @Column({ unique: true })
  nombre: string;

  @ApiProperty({
    type: () => [Permission],
    description: 'Permisos asignados al rol. Lista de objetos Permission.'
  })
  @ManyToMany(() => Permission, { eager: true })
  @JoinTable()
  permisos: Permission[];
}