import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ unique: true })
  slug: string;
}