import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn } from 'typeorm';
import { Role } from '../../auth/entities/role.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  correo: string;

  @Column()
  nombreCompleto: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, { eager: true })
  rol: Role;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}