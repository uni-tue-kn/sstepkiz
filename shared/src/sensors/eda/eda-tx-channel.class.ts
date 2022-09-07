import { ChannelType } from "../../peer/channel-type.enum";
import { TxChannel } from "../../peer/tx-channel.class";
import { EdaData } from "./eda-data.interface";

export class EdaTxChannel extends TxChannel {

  /**
   * Forwards data from sensors to data channel.
   * @param data Received data.
   */
  readonly dataListener: (data: EdaData) => void = (data: EdaData) => {
    this.send(data);
  }

  /**
   * The type of the channel.
   */
  readonly type: ChannelType = ChannelType.eda;

  /**
   * Constructs a new EDA TX-Channel.
   * @param userId Identity of user that this channel is connected to.
   * @param peerConnection RTC peer connection to remote peer.
   */
  constructor(userId: string, peerConnection: RTCPeerConnection) {
    super(userId, peerConnection, 'eda');
  }

  /**
   * Sends data to the remote peer.
   * @param data Data to send.
   */
  send(data: EdaData): void {
    super.send(JSON.stringify(data));
  }
}
