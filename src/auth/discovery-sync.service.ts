import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { PERMISSION_KEY } from './decorators/has-permission.decorator';
import { PermissionsService } from './permissions/permissions.service';

@Injectable()
export class DiscoverySyncService {
  private readonly logger = new Logger(DiscoverySyncService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly permissionsService: PermissionsService,
  ) {
    this.logger.log('DiscoverySyncService instanciado');
  }

  async syncPermissions() {
    this.logger.log('Iniciando sincronización de permisos con DiscoveryService...');
    const permissions = new Set<string>();
    const methods = await this.discoveryService.providerMethodsWithMetaAtKey(PERMISSION_KEY);
    this.logger.log(`[DEBUG] Total de métodos con permisos detectados: ${methods.length}`);
    for (const method of methods) {
      const permission = method.meta;
      permissions.add(String(permission));
      this.logger.log(`Detectado permiso: ${permission}`);
    }
    for (const permission of permissions) {
      await this.permissionsService.createIfNotExists({ nombre: permission, descripcion: `Permiso para ${permission}` });
      this.logger.log(`Permiso sincronizado: ${permission}`);
    }
  }
}
