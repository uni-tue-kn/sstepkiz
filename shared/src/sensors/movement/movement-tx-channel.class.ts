import { ChannelType } from "../../peer/channel-type.enum";
import { TxChannel } from "../../peer/tx-channel.class";
import { MovementData } from "./movement-data.interface";

export class MovementTxChannel extends TxChannel {

  /**
   * Forwards data from sensors to data channel.
   * @param data Received data.
   */
  readonly dataListener: (data: MovementData) => void = (data: MovementData) => {
    this.send(data);
  }

  /**
   * The type of the channel.
   */
  readonly type: ChannelType = ChannelType.movement;

  /**
   * Constructs a new Movement TX-Channel.
   * @param userId Identity of user that this channel is connected to.
   * @param peerConnection RTC peer connection to remote peer.
   */
  constructor(userId: string, peerConnection: RTCPeerConnection) {
    super(userId, peerConnection, 'mov');
  }

  /**
   * Sends data to the remote peer.
   * @param data Data to send.
   */
  send(data: MovementData): void {
    super.send(JSON.stringify(data));
  }
}
