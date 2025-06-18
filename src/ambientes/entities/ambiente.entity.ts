import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity('ambientes')
export class Ambiente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clienteId: number;

  @Column()
  nombre: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  prefijo?: string;

  @Column()
  comandoUp: string;

  @Column()
  comandoDown: string;

  @Column('simple-array', { nullable: true })
  perfiles?: string[];

  @Column({ default: false })
  autostart?: boolean;

  @Column({ nullable: true })
  orden?: number;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}