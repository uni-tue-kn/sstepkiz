import { DeviceType } from "./device-type.enum";

export interface CallOffer {

  /**
   * Mode of call.
   */
  mode: DeviceType.Monitor | DeviceType.Receiver;

  /**
   * Identity of new session.
   */
  sessionId: string;

  /**
   * Identity of socket that requested the call.
   */
  socketId: string;

  /**
   * Identity of user that requested the call.
   */
  userId: string;
}
