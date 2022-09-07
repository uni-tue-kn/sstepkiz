export enum AuthState {
  /**
   * Something went wrong.
   */
  failed = -1,

  /**
   * Not yet discovered.
   */
  none = 0,

  /**
   * Getting metadata document.
   */
  discovering = 1,

  /**
   * Metadata document discovered.
   */
  discovered = 2,

  /**
   * Performing authentication.
   * User action required.
   */
  authenticating = 3,

  /**
   * Performing PKCE challenge.
   */
  verifying = 4,

  /**
   * Authentication performed.
   */
  authenticated = 5,
}
