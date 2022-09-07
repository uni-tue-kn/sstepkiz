import { Module, DynamicModule } from '@nestjs/common';

import { AuthService } from './auth/auth.service';
import { JwtBearerAuthGuard } from './guards/jwt-bearer-auth.guard/jwt-bearer-auth.guard';
import { JwtQueryAuthGuard } from './guards/jwt-query-auth.guard/jwt-query-auth.guard';
import { ScopeGuard } from './guards/scope.guard/scope.guard';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy/jwt-bearer.strategy';
import { JwtQueryStrategy } from './strategies/jwt-query.strategy/jwt-query.strategy';
import { AuthModuleAsyncOptions } from './types/auth-module-async-options.interface';
import { AuthOptions } from './types/auth-options.class';

@Module({})
export class AuthModule {
  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    const exports = [
      AuthService,
      JwtBearerAuthGuard,
      JwtBearerStrategy,
      JwtQueryAuthGuard,
      JwtQueryStrategy,
      ScopeGuard,
    ];
    return {
      exports,
      global: options.global,
      imports: options.imports,
      module: AuthModule,
      providers: [
        {
          inject: options.inject || [],
          provide: AuthOptions,
          useFactory: options.useFactory,
        },
        ...exports,
      ],
    };
  }
}
