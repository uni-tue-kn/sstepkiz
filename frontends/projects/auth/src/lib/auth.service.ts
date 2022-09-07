import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { AuthModuleConfig } from './auth-module-config.class';

@Injectable({ providedIn: 'root' })
export class AuthService {

  get accessToken(): string {
    return this.oauthService.getAccessToken();
  }

  get claims(): any {
    return this.oauthService.getIdentityClaims();
  }

  /**
   * Gets if user is authenticated.
   */
  get isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  constructor(
    private readonly authConfig: AuthModuleConfig,
    private readonly oauthService: OAuthService,
  ) {
    // Apply OAuth configuration.
    this.oauthService.configure(this.authConfig);
    // Go to login page if not authenticated.
    this.oauthService.loadDiscoveryDocumentAndLogin();
  }

  /**
   * Start Authorization Code Flow by redirecting the navigator to the Authorization Server's login page.
   */
  login(): void {
    this.oauthService.initCodeFlow();
  }

  /**
   * Performs a logout request to Authorization Server and deletes the Access and Refresh Token.
   */
  logout(): void {
    this.oauthService.logOut();
  }
}
