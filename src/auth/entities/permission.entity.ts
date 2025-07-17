import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string; // Ejemplo: 'crear_cliente', 'borrar_ambiente'

  @Column({ nullable: true })
  descripcion: string;
}