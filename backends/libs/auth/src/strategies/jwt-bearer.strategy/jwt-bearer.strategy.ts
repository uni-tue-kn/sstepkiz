import { Injectable } from '@nestjs/common';
import passport from 'passport';
import { ExtractJwt } from 'passport-jwt';

import { AuthOptions } from '../../types/auth-options.class';
import { JwtStrategy } from '../jwt.strategy/jwt.strategy';

@Injectable()
export class JwtBearerStrategy extends JwtStrategy {
  /**
   * Constructs a new JWT strategy using bearer token from HTTP bearer authorization header.
   * @param configService Instance of auth configuration service.
   */
  constructor(authOptions: AuthOptions) {
    super(authOptions.oidc, ExtractJwt.fromAuthHeaderAsBearerToken());
    passport.use('jwtbearer', this);
  }
}
