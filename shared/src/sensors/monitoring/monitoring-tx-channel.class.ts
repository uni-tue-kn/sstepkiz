import { ChannelType } from "../../peer/channel-type.enum";
import { TxChannel } from "../../peer/tx-channel.class";
import { MonitoringData } from "./monitoring-data.interface";

export class MonitoringTxChannel extends TxChannel {

  /**
   * Forwards data from sensors to data channel.
   * @param data Received data.
   */
  readonly dataListener: (data: MonitoringData) => void = (data: MonitoringData) => {
    this.send(data);
  }

  /**
   * The type of the channel.
   */
  readonly type: ChannelType = ChannelType.monitoring;

  /**
   * Constructs a new Monitoring TX-Channel.
   * @param userId Identity of user that this channel is connected to.
   * @param peerConnection RTC peer connection to remote peer.
   */
  constructor(userId: string, peerConnection: RTCPeerConnection) {
    super(userId, peerConnection, 'mon');
  }

  /**
   * Sends data to the remote peer.
   * @param data Data to send.
   */
  send(data: MonitoringData): void {
    super.send(JSON.stringify(data));
  }
}
