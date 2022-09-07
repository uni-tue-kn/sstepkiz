import { ModuleWithProviders, NgModule } from '@angular/core';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AuthModuleConfig } from './auth-module-config.class';

@NgModule({})
export class AuthModule {
  static forRoot(config: AuthModuleConfig): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        { provide: AuthModuleConfig, useValue: config },
        OAuthModule.forRoot({
          resourceServer: {
            allowedUrls: config.authUrls,
            sendAccessToken: true
          }
        }).providers
      ]
    };
  }
}
