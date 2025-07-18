import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { PERMISSION_KEY } from '../decorators/has-permission.decorator';

import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PermissionSyncService {
  private readonly logger = new Logger(PermissionSyncService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
  ) {}

  async syncPermissions() {
    this.logger.log('Iniciando sincronización automática de permisos...');
    const permissions = new Set<string>();
    const methods = await this.discoveryService.controllerMethodsWithMetaAtKey<string>(PERMISSION_KEY);
    this.logger.log(`[DEBUG] Métodos decorados encontrados: ${methods.length}`);
    for (const method of methods) {
      const permission = method.meta;
      permissions.add(permission);
      this.logger.log(`Detectado permiso: ${permission}`);
    }
    // Sincronizar permisos nuevos
    for (const permission of permissions) {
      await this.permissionsService.createIfNotExists({ nombre: permission, descripcion: `Permiso para ${permission}` });
      this.logger.log(`Permiso sincronizado: ${permission}`);
    }
    // Buscar permisos huérfanos (en base pero no en código)
    const dbPerms = await this.permissionsService.findAll();
    const huérfanos = dbPerms.filter(p => !permissions.has(p.nombre));
    if (huérfanos.length > 0) {
      this.logger.warn(`[SYNC] Permisos en base pero no en código (huérfanos): ${huérfanos.map(p => p.nombre).join(', ')}`);
      // Pausa interactiva para confirmar eliminación
      // eslint-disable-next-line no-alert
      // En entorno CLI, no hay prompt interactivo real, así que usar variable de entorno o eliminar directamente si se desea automatizar
      const shouldDelete = process.env.PERMISSIONS_DELETE_ORPHANS === 'true';
      if (shouldDelete) {
        for (const orphan of huérfanos) {
          // Buscar roles que tengan este permiso
          const roles = await this.rolesService.findAll();
          for (const role of roles) {
            if (role.permisos.some((p: any) => p.id === orphan.id)) {
              role.permisos = role.permisos.filter((p: any) => p.id !== orphan.id);
              await this.rolesService.update(role.id, { permisos: role.permisos.map((p: any) => p.id) });
              this.logger.warn(`[SYNC] Permiso huérfano removido del rol '${role.nombre}'`);
            }
          }
          await this.permissionsService.remove(orphan.id);
          this.logger.warn(`[SYNC] Permiso huérfano eliminado: ${orphan.nombre}`);
        }
      } else {
        this.logger.warn('[SYNC] Para eliminar estos permisos huérfanos automáticamente, establezca la variable de entorno PERMISSIONS_DELETE_ORPHANS=true');
      }
    } else {
      this.logger.log('[SYNC] No hay permisos huérfanos.');
    }
  }
}
