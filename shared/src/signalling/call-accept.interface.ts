export interface CallAccept {

  /**
   * Identity of session.
   */
  sessionId: string;

  /**
   * Identity of socket that accepted the call.
   */
  socketId: string;
}
