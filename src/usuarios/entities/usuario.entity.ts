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

  @Column({ nullable: true })
  roleId: number;


  @ManyToOne(() => Role, { eager: true })
  role: Role;

  @Column({ nullable: true })
  refreshToken?: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}