import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from './core/core.module';
import { ClientesModule } from './clientes/clientes.module';
import { AmbientesModule } from './ambientes/ambientes.module';
import { DockerModule } from './docker/docker.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AppController } from './app.controller';
import { PermissionSyncService } from './auth/permission-sync.service';
import { AuthModule } from './auth/auth.module';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database:
          config.get('NODE_ENV') === 'test'
            ? ':memory:'
            : config.get('DATABASE_PATH') || './data/dockmin.sqlite',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') === 'development' && config.get('DATABASE_SYNCHRONIZE') ? true : false, // solo para desarrollo y test
        dropSchema: config.get('NODE_ENV') === 'test',
      }),
    }),
    CoreModule,
    ClientesModule,
    AmbientesModule,
    DockerModule,
    UsuariosModule,
    AuthModule,
    DiscoveryModule,
  ],
  controllers: [AppController],
  providers: [
    PermissionSyncService,
  ],
})
export class AppModule {
  constructor(private readonly permissionSyncService: PermissionSyncService) {}

  async onApplicationBootstrap() {
    await this.permissionSyncService.syncPermissions();
  }
}