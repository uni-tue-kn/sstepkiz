export interface SenderDescription {

  /**
   * Mapping of user identities to array of socket identities.
   */
  [userId: string]: string[];
}
