
import { SetMetadata } from '@nestjs/common';
export const PERMISSION_KEY = 'permission';

/**
 * Decorador para asignar permisos a métodos de controlador.
 * Si no se pasa argumento, genera el permiso automáticamente como controller.method.
 */
export function HasPermission(permissionName?: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    let permission = permissionName;
    if (!permission) {
      const controllerName = target.constructor.name.replace('Controller', '').toLowerCase();
      const methodName = propertyKey.toString();
      permission = `${controllerName}.${methodName}`;
    }
    return SetMetadata(PERMISSION_KEY, permission)(target, propertyKey, descriptor);
  };
}
