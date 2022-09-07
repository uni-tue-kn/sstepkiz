import { HangupReason } from "./hangup-reason.enum";

export interface HangupOffer {

  /**
   * Reason for hangup.
   */
  reason: HangupReason;

  /**
   * Identity of session.
   */
  sessionId: string;

  /**
   * Identity of socket that hangup.
   */
  socketId: string;
}
