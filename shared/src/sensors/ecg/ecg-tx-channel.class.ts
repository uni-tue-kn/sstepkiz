import { ChannelType } from "../../peer/channel-type.enum";
import { TxChannel } from "../../peer/tx-channel.class";
import { EcgData } from "./ecg-data.interface";

export class EcgTxChannel extends TxChannel {

  /**
   * Forwards data from sensors to data channel.
   * @param data Received data.
   */
  readonly dataListener: (data: EcgData) => void = (data: EcgData) => {
    this.send(data);
  }

  /**
   * The type of the channel.
   */
  readonly type: ChannelType = ChannelType.ecg;

  /**
   * Constructs a new ECG TX-Channel.
   * @param userId Identity of user that this channel is connected to.
   * @param peerConnection RTC peer connection to remote peer.
   */
  constructor(userId: string, peerConnection: RTCPeerConnection) {
    super(userId, peerConnection, 'ecg');
  }

  /**
   * Sends data to the remote peer.
   * @param data Data to send.
   */
  send(data: EcgData): void {
    super.send(JSON.stringify(data));
  }
}
