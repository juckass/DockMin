import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmbientesService } from './ambientes.service';
import { AmbientesController } from './ambientes.controller';
import { Ambiente } from './entities/ambiente.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ambiente, Cliente])],
  controllers: [AmbientesController],
  providers: [AmbientesService],
})
export class AmbientesModule {}
