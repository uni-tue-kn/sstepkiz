export interface DescriptionOffer {

  /**
   * RTC session description.
   */
  description: RTCSessionDescriptionInit;

  /**
   * Identity of session.
   */
  sessionId: string;

  /**
   * Identity of socket that sent the description.
   */
  socketId: string;
}
