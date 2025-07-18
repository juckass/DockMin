import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Permitir si el endpoint es público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
    if (!requiredPermission) {
      // Si no se requiere permiso específico, permitir
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }
    // Si el usuario es admin, permitir todo
    if (user.rol === 'admin' || user.rol === 'administrador') {
      return true;
    }
    // Validar si el usuario tiene el permiso requerido
    const permisos = user.permisos || [];
    if (permisos.includes(requiredPermission)) {
      return true;
    }
    throw new ForbiddenException('No tienes permisos para realizar esta acción');
  }
}
