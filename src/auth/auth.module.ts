import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { RolesService } from './roles/roles.service';
import { RolesController } from './roles/roles.controller';
import { PermissionsService } from './permissions/permissions.service';
import { PermissionsController } from './permissions/permissions.controller';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsuariosModule,
    TypeOrmModule.forFeature([Role, Permission, Usuario]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'supersecretkey'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION', '1h') },
      }),
    }),
  ],
  providers: [AuthService, RolesService, PermissionsService, SeedService, JwtStrategy],
  exports: [AuthService, PermissionsService, RolesService],
  controllers: [AuthController, RolesController, PermissionsController],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.runSeed();
  }
}
