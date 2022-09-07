import { SenderDescription } from './sender-description.interface';

export interface RegistrationResponse {

  /**
   * Identities of sender sockets.
   */
  senders?: SenderDescription;

  /**
   * Identity of this socket.
   */
  socketId: string;
}
