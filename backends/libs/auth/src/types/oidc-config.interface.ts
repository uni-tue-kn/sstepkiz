export interface OidcOptions {
  /**
   * Array of allowed algorithms.
   */
  algorithms: string[];

  /**
   * Audience of JWT.
   */
  audience: string;

  /**
   * Issuer of the Access Token.
   */
  issuer: string;

  /**
   * Public key of Authorization Server.
   */
  publicKey: string;
}
