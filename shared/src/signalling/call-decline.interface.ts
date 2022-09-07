export interface CallDecline {

  /**
   * Identity of session.
   */
  sessionId: string;

  /**
   * Identity of socket that declined the call.
   */
  socketId: string;
}
