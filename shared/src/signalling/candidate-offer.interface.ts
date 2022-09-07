export interface CandidateOffer {

  /**
   * ICE candidate.
   */
  candidate: RTCIceCandidateInit;

  /**
   * Identity of session.
   */
  sessionId: string;

  /**
   * Identity of socket that sent the candidate.
   */
  socketId: string;
}
