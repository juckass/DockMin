import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmbientesService } from './ambientes.service';
import { AmbientesController } from './ambientes.controller';
import { Ambiente } from './entities/ambiente.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ClientesModule } from '../clientes/clientes.module';

@Module({
  imports: [ClientesModule, TypeOrmModule.forFeature([Ambiente, Cliente])],
  providers: [AmbientesService],
  controllers: [AmbientesController],
  exports: [AmbientesService],
})
export class AmbientesModule {}
