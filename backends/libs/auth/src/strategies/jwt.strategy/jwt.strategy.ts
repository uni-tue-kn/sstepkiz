import { PassportStrategy } from '@nestjs/passport';
import { JwtFromRequestFunction, Strategy } from 'passport-jwt';

import { OidcOptions } from '../../types/oidc-config.interface';
import { TokenPayload } from '../..//types/token-payload.interface';

export abstract class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructs a new JWT strategy.
   * @param oidcConfig Open ID Connect configuration.
   * @param jwtFromRequest Function that gets the JWT token from request.
   */
  constructor(oidcConfig: OidcOptions, jwtFromRequest: JwtFromRequestFunction) {
    super({
      algorithms: oidcConfig.algorithms,
      audience: oidcConfig.audience,
      ignoreExpiration: false,
      issuer: oidcConfig.issuer,
      jwtFromRequest,
      secretOrKey: oidcConfig.publicKey,
    });
  }

  /**
   * Adds the attribute 'user' to the current request.
   * @param payload JWT Payload.
   */
  async validate(payload: any): Promise<TokenPayload> {
    return {
      email: payload.email,
      emailVerified: payload.email_verified,
      familyName: payload.family_name,
      givenName: payload.given_name,
      roles: payload.realm_access?.roles || [],
      scope: (payload.scope as string).split(' ') || [],
      username: payload.preferred_username,
    };
  }
}
