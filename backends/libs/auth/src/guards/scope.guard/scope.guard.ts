import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TokenPayload } from '@libs/auth/types/token-payload.interface';
import { LoggerService } from '@libs/logger';

@Injectable()
export class ScopeGuard implements CanActivate {
  /**
   * Constructs a new scope guard.
   * @param reflector Reflector instance.
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
  ) {
    this.logger.debug(`Scope Guard loaded`, this.constructor.name);
  }

  /**
   * Validates, if scope is sufficient.
   * @param context Execution context.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get required scopes from Scopes decorator.
    const requiredScopes = this.reflector.get<string[]>(
      'scopes',
      context.getHandler(),
    );
    // Grant, if no scopes required.
    if (!requiredScopes || requiredScopes.length === 0) return true;
    // Get token payload.
    const user = context.switchToHttp().getRequest().user as TokenPayload;
    // Deny, if no token payload found (= not authenticated).
    if (!user) {
      this.logger.warn(`Request denied: No token payload found`, this.constructor.name);
      return false;
    }
    // Deny, if application has no scope.
    if (user.scope.length === 0) {
      this.logger.warn(`Request denied: No scope in token payload found`, this.constructor.name);
      return false;
    }
    // Grant, if all required scopes in applications's scope.
    if (!requiredScopes.every(s => user.scope.indexOf(s) >= 0)) {
      this.logger.warn(`Request denied: Not all scopes found! Required scopes: ${JSON.stringify(requiredScopes)}, found scopes: ${JSON.stringify(user.roles)}`, this.constructor.name);
      return false;
    }
    return true;
  }
}
