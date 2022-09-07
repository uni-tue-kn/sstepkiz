import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {

  /**
   * Expected token issuer.
   */
  private readonly issuer = environment.urls.ssoServer;

  /**
   * Emits when user authenticated successfully.
   */
  readonly authenticated = new EventEmitter<void>();

  /**
   * Token scopes to request.
   */
  private readonly scopes = [
    'openid',
    'profile',
    'email',
    'offline_access',
    ...environment.requiredScopes,
  ];

  /**
   * Gets identity claims of token payload.
   */
  get claims(): object {
    return this.oauth.getIdentityClaims();
  }

  /**
   * Gets if user is authenticated.
   */
  get isAuthenticated(): boolean {
    return this.oauth.hasValidAccessToken();
  }

  /**
   * Constructs a new auth service.
   * @param oauth OAuth Service instance.
   */
  constructor(
    private readonly oauth: OAuthService,
  ) {
    this.oauth.configure({
      clientId: environment.clientId,
      issuer: this.issuer,
      redirectUri: window.location.origin + window.location.pathname,
      responseType: 'code',
      scope: this.scopes.join(' '),
      strictDiscoveryDocumentValidation: false,
      skipIssuerCheck: true,
      useSilentRefresh: true,
    });
    this.oauth.loadDiscoveryDocumentAndLogin().then((success) => {
      if (success) {
        this.authenticated.emit();
      }
    });
  }

  /**
   * Starts Authorization Code Flow by redirecting navigator to authorization server's authorization page.
   */
  login(): void {
    this.oauth.initCodeFlow();
  }

  /**
   * Performs logout request to authorization server and deletes tokens.
   */
  logout(): void {
    this.oauth.logOut();
  }
  
  /**
   * Logs out when destroying service.
   */
  ngOnDestroy(): void {
    this.logout();
  }
}
