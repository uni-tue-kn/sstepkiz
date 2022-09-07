import { AuthConfig } from 'angular-oauth2-oidc';

export class AuthModuleConfig extends AuthConfig {

  /**
   * Urls that should be authenticated.
   */
  authUrls: string[] = [];

  /**
   * Identity of OAuth client.
   */
  clientId = '';

  /**
   * URL of the Authorization Server (= Identity Provider).
   */
  issuer = 'https://sso.example.org/auth/realms/sstep-kiz';
  /**
   * URL of this application to redirect to after login.
   */
  redirectUri?: string = window.location.origin + window.location.pathname;

  /**
   * Requested response type.
   * 'code' indicates, that a Authorization Code is requested.
   */
  responseType = 'code';

  /**
   * Defines whether every url provided by the discovery
   * document has to start with the issuer's url.
   */
  strictDiscoveryDocumentValidation?: boolean = false;

  /**
   * Defined whether to skip the validation of the issuer in the discovery document.
   * Normally, the discovery document's url starts with the url of the issuer.
   */
  skipIssuerCheck?: boolean = true;

  /**
   * Requested scope of authorization.
   * The first 4 scopes are predefined by OIDC (offline_acces is required to get a refresh token).
   */
  scope = 'openid profile email offline_access';

  /**
   * If debug information should be showed.
   */
  showDebugInformation = false;

  /**
   * Enables silent refresh of Access Token when it expires using Refresh Token.
   */
  useSilentRefresh = true;

  constructor(json?: Partial<AuthModuleConfig>) {
    super(json);
    // Object.assign(this, ...json);
    Object.getOwnPropertyNames(json).forEach(p => {
      this[p] = json[p];
    });
  }
}
