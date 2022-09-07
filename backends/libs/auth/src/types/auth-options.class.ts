import * as fs from 'fs';

import { OidcOptions } from './oidc-config.interface';

export class AuthOptions {
  /**
   * OpenID Connect configuration.
   */
  readonly oidc: OidcOptions;

  /**
   * Constructs new auth options.
   * @param options Options to apply.
   */
  constructor(options: Partial<AuthOptions>) {
    Object.assign(this, options);
  }

  /**
   * Loads Auth options from configuration.
   * @param configService Configuration service.
   * @returns Loaded auth options.
   */
  static fromConfigFile(configService: {
    get: <T>(propertyPath: string, defaultValue?: T) => T;
  }): AuthOptions {
    const algorithms = configService.get<string>('OIDC_ALGORITHMS').split(',');
    const publicKey = fs
      .readFileSync(configService.get<string>('OIDC_PUBLIC_KEY_FILE'))
      .toString();
    return new AuthOptions({
      oidc: {
        algorithms,
        audience: configService.get<string>('OIDC_AUDIENCE'),
        issuer: configService.get<string>('OIDC_ISSUER'),
        publicKey,
      },
    });
  }
}
