import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  correo: string;

  @Column()
  nombreCompleto: string;

  @Column()
  contraseña: string;

  @Column({ default: 'user' })
  rol: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}