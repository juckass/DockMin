import { Module, forwardRef } from '@nestjs/common';
import { DockerService } from './docker.service';
import { DockerController } from './docker.controller';
import { AmbientesModule } from '../ambientes/ambientes.module';

@Module({
  imports: [forwardRef(() => AmbientesModule)],
  controllers: [DockerController],
  providers: [DockerService],
})
export class DockerModule {}
