import { DeviceType } from "./device-type.enum";

export interface CallRequest {

  /**
   * Mode of call.
   */
  mode: DeviceType.Monitor | DeviceType.Receiver;

  /**
   * Identity of socket to call.
   */
  socketId: string;
}
