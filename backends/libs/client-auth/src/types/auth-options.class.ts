import { readSecret } from '@libs/common';

import { PKCEChallengeMethod } from '../types/pkce-challenge-method.type';
import { SigningAlgorithm } from '../types/signing-algorithm.type';
import { DEFAULT_PORT } from 'apps/aggregator/src/environment';

export class AuthOptions {
  /**
   * Method for PKCE challenge.
   */
  challengeMethod: PKCEChallengeMethod = 'S256';

  /**
   * Identity of the client.
   */
  clientId = '';

  /**
   * Secret of the client.
   */
  clientSecret?: string = undefined;

  /**
   * FQDN of host of this application.
   */
  host = 'http://localhost:80';

  /**
   * Root URI of (realm at) auth server.
   */
 issuer = 'https://sso.example.org/auth/realms/sstep-kiz';
    // issuer = 'http://localhost:8180/auth/realms/sstepkiz';


  /**
   * Scopes to request.
   */
  scopes: string[] = ['openid', 'email', 'profile'];

  /**
   * Signing algorithm for ID token, access token and user info.
   */
  signingAlgorithm: SigningAlgorithm = 'RS256';

  /**
   * Constructs new auth options.
   * @param options Auth options.
   */
  constructor(options: Partial<AuthOptions>) {
    Object.assign(this, options);
  }

  /**
   * Loads Auth options from configuration.
   * @param configService Configuration service.
   * @returns Loaded auth options.
   */
  static async fromConfigFile(configService: {
    get: <T>(propertyPath: string, defaultValue?: T) => T;
  }): Promise<AuthOptions> {
    const [clientId, clientSecret] = await Promise.all([
      readSecret(configService, 'OIDC_CLIENT_ID'),
      readSecret(configService, 'OIDC_CLIENT_SECRET'),
    ]);
    return new AuthOptions({
      challengeMethod: configService.get<PKCEChallengeMethod>(
        'OIDC_CHALLENGE_METHOD',
        'S256',
      ),
      clientId,
      clientSecret,
      host:
        'http://localhost:' +
        configService.get<number>('PORT', DEFAULT_PORT).toString(),
      issuer: configService.get<string>('OIDC_ISSUER'),
      scopes: configService
        .get<string>('OIDC_SCOPES', 'openid,email,profile')
        .split(','),
      signingAlgorithm: configService.get<SigningAlgorithm>(
        'OIDC_SIGNING_ALG',
        'RS256',
      ),
    });
  }
}
