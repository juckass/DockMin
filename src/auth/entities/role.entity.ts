import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Role {

  @ApiProperty({ example: 1, description: 'Identificador único del rol' })
  @PrimaryGeneratedColumn()
  id: number;


  @ApiProperty({ example: 'admin', description: 'Nombre único del rol. Ejemplo: admin, user' })
  @Column({ unique: true })
  nombre: string;


  @ApiProperty({ type: () => [Permission], description: 'Permisos asignados al rol' })
  @ManyToMany(() => Permission, { eager: true })
  @JoinTable()
  permisos: Permission[];
}