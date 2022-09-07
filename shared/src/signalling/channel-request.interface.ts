import { ChannelType } from "../peer/channel-type.enum";

export interface ChannelRequest {

  /**
   * Identity of session.
   */
  sessionId: string;

  /**
   * Identity of a socket.
   * In case of Peer -> Signalling Server: Socket ID of target.
   * In case of Signalling Server -> Peer: Socket ID of source.
   */
  socketId: string;

  /**
   * Types of requested channels.
   */
  types: ChannelType[];
}
