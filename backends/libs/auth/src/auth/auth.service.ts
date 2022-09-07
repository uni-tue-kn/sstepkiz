import { Injectable } from '@nestjs/common';
import { jwtVerify, JWTVerifyResult } from 'jose';
import { createPublicKey, KeyObject } from 'crypto'

import { AuthOptions } from '../types/auth-options.class';
import { SIGNALLING_ERROR_AUTHENTICATION } from '../../../../../shared/dist';

@Injectable()
export class AuthService {
  // private _tokenVerifier?: JWS.Verifier;
  private readonly publicKey: KeyObject;
  // private async getTokenVerifier(): Promise<JWS.Verifier> {
  //   if (this._tokenVerifier) {
  //     return this._tokenVerifier;
  //   } else {
  //     this._tokenVerifier = await this.generateTokenVerifier(
  //       this.options.oidc.publicKey,
  //     );
  //     return this._tokenVerifier;
  //   }
  // }

  constructor(private readonly options: AuthOptions) {
    this.publicKey = createPublicKey(options.oidc.publicKey)
  }

  // parseJwtPayload(verifiedToken: JWS.VerificationResult): any {
  //   try {
  //     const payloadBuffer: Buffer = verifiedToken.payload;
  //     const payloadString: string = payloadBuffer.toString('utf8');
  //     const payloadObject: any = JSON.parse(payloadString);
  //     return payloadObject;
  //   } catch (error) {
  //     console.error('Parsing of token failed', error);
  //     throw SIGNALLING_ERROR_INTERNAL;
  //   }
  // }

  async verifyToken(token: string): Promise<JWTVerifyResult> {
    try {
      return await jwtVerify(token, this.publicKey, {
        issuer: this.options.oidc.issuer,
        audience: this.options.oidc.audience,
        algorithms : this.options.oidc.algorithms,
      });
    } catch (error) {
      throw SIGNALLING_ERROR_AUTHENTICATION;
    }
    // const verifier = await this.getTokenVerifier();
    // try {
    //   const verified = await verifier.verify(token);
    //   return verified;
    // } catch (error) {
    //   console.error('Token verification failed', error);
    //   throw SIGNALLING_ERROR_AUTHENTICATION;
    // }
  }

  // private async generateTokenVerifier(
  //   publicKey: string,
  // ): Promise<JWS.Verifier> {
  //   const key = await JWK.asKey(publicKey, 'pem');
  //   this.options.oidc.issuer;
  //   const verifier = JWS.createVerify(key, {
  //     algorithms: this.options.oidc.algorithms,
  //   });
  //   return verifier;
  // }
}
