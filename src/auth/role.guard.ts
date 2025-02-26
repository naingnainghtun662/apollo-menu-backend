import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/types';
import { AuthGuard } from './auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authGuard: AuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Run AuthGuard first to ensure request.user is set
    const isAuthenticated = await this.authGuard.canActivate(context);
    if (!isAuthenticated) return false;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log({ requiredRoles });

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    console.log({ request });
    console.log({ user: request.user, roles: request.user?.roles });

    const roles = request.user?.roles;

    const roleNames = roles?.map(
      (r: { role: { name: any } }) => r.role.name,
    ) as string[];
    console.log({ requiredRoles, userRoles: roleNames });
    if (!requiredRoles.some((role) => roleNames?.includes(role))) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }
    return true;
  }
}
