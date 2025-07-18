import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Permission {

  @ApiProperty({ example: 1, description: 'Identificador único del permiso' })
  @PrimaryGeneratedColumn()
  id: number;


  @ApiProperty({ example: 'crear_cliente', description: 'Nombre único del permiso. Ejemplo: crear_cliente, borrar_ambiente' })
  @Column({ unique: true })
  nombre: string;


  @ApiProperty({ example: 'Permite crear clientes', required: false, description: 'Descripción opcional del permiso' })
  @Column({ nullable: true })
  descripcion: string;
}