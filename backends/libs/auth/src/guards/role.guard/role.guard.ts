import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TokenPayload } from '@libs/auth/types/token-payload.interface';
import { LoggerService } from '@libs/logger';

@Injectable()
export class RoleGuard implements CanActivate {
  /**
   * Constructs a new role guard.
   * @param reflector Reflector instance.
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
  ) {
    this.logger.debug(`Role Guard loaded`, this.constructor.name);
  }

  /**
   * Validates, if roles are sufficient.
   * @param context Execution context.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get required roles from Roles decorator.
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    // Grant, if no roles required.
    if (!requiredRoles || requiredRoles.length === 0) return true;
    // Get token payload.
    const user = context.switchToHttp().getRequest().user as TokenPayload;
    // Deny, if no token payload found (= not authenticated).
    if (!user) {
      this.logger.warn(`Request denied: No token payload found`, this.constructor.name);
      return false;
    }
    // Deny, if user has no roles.
    if ((user.roles?.length ?? 0) === 0) {
      this.logger.warn(`Request denied: No roles in token payload found`, this.constructor.name);
      return false;
    }
    // Grant, if user has all roles that are required.
    if (!requiredRoles.every(r => user.roles.indexOf(r) >= 0)) {
      this.logger.warn(`Request denied: Not all roles found! Required roles: ${JSON.stringify(requiredRoles)}, found roles: ${JSON.stringify(user.roles)}`, this.constructor.name);
      return false;
    }
    return true;
  }
}
