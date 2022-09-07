export interface TokenPayload {
  /**
   * Email address, the user is registered with.
   */
  email?: string;

  /**
   * Indicates if email address is yet verified.
   */
  emailVerified?: boolean;

  /**
   * Family name of user.
   */
  familyName?: string;

  /**
   * Given name of user.
   */
  givenName?: string;

  /**
   * Roles of user.
   */
  roles: string[];

  /**
   * Granted scope of application.
   */
  scope: string[];

  /**
   * Username of user.
   */
  username: string;
}
