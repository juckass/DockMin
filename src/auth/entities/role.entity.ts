import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string; // Ejemplo: 'admin', 'user'

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable()
  permisos: Permission[];
}