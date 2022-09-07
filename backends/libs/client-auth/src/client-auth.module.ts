import { DynamicModule, Module } from '@nestjs/common';

import { AuthController } from './controllers/auth/auth.controller';
import { LoginController } from './controllers/login/login.controller';
import { AuthService } from './services/auth.service';
import { AuthModuleAsyncOptions } from './types/auth-module-async-options.interface';
import { AuthOptions } from './types/auth-options.class';

@Module({
  controllers: [AuthController, LoginController],
  exports: [AuthService],
  providers: [AuthService],
})
export class ClientAuthModule {
  /**
   * Generates the AuthModule dynamically.
   * @param options Async options for auth service.
   */
  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    return {
      global: options.global,
      imports: options.imports,
      module: ClientAuthModule,
      providers: [
        {
          inject: options.inject || [],
          provide: AuthOptions,
          useFactory: options.useFactory,
        },
      ],
    };
  }
}
