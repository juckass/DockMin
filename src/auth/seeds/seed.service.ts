import { Injectable, Logger } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';
import { PermissionsService } from '../permissions/permissions.service';
import { UsuariosService } from '../../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';



@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async runSeed() {
    // 1. Crear roles si no existen
    const adminRole = await this.rolesService.createIfNotExists({ nombre: 'admin', permisos: [] });
    const userRole = await this.rolesService.createIfNotExists({ nombre: 'user', permisos: [] });
    this.logger.log('Roles verificados: admin y user');

    // 2. Crear usuario admin si no existe
    const adminUser = await this.usuariosService.findByEmail('admin@dockmin.com');
    if (!adminUser) {
     
      const hashedPassword = "admin123";
      await this.usuariosService.create({
        email: 'admin@dockmin.com',
        nombreCompleto: 'Administrador',
        password: hashedPassword,
        roleId: adminRole.id,
      });
      this.logger.log('Usuario admin creado');
    } else {
      this.logger.log('Usuario admin ya existe');
    }
  }
}

// Métodos auxiliares en los servicios Roles y Permissions:
// - createIfNotExists(dto): busca por nombre y crea si no existe.
// - findAll(): retorna todos los registros.
// - findByEmail(email): busca usuario por email.
// - create(dto): crea usuario.
