import { ChannelType } from "../../peer/channel-type.enum";
import { TxChannel } from "../../peer/tx-channel.class";
import { EyeTrackingData } from "./eyetracking-data.interface";
import { EyeTrackingEvent } from "./eyetracking-event.interface";

export class EyeTrackingTxChannel extends TxChannel {

  /**
   * Forwards data from sensors to data channel.
   * @param data Received data.
   */
  readonly dataListener: (data: EyeTrackingEvent) => void = (data: EyeTrackingEvent) => {
    switch (data.type) {
      case 'data':
        this.send(data.data as EyeTrackingData);
        break;
      case 'track':
        const track = data.data as MediaStreamTrack;
        try {
          this.trackSender = this.peerConnection.addTrack(track);
        } catch (error) {
          process.stdout.write(`Failed to add track of type ${typeof(track)} with id ${track.id} and label ${track.label} to peer: ${error}\n`);
          // throw `Failed to add track to peer connection: ${error}`;
        }
        break;
    }
  }

  /**
   * Sender instance of field camera video track.
   */
  private trackSender?: RTCRtpSender = undefined;

  /**
   * The type of the channel.
   */
  readonly type: ChannelType = ChannelType.eyetracking;

  /**
   * Constructs a new EyeTracking TX-Channel.
   * @param userId Identity of user that this channel is connected to.
   * @param peerConnection RTC peer connection to remote peer.
   */
  constructor(userId: string, peerConnection: RTCPeerConnection) {
    super(userId, peerConnection, 'etk');
    }

  /**
   * Closes the channel.
   */
  close(): void {
    if (this.trackSender && this.peerConnection.connectionState !== 'closed') {
      this.peerConnection.removeTrack(this.trackSender);
    }
    super.close();
  }

  /**
   * Sends data to the remote peer.
   * @param data Data to send.
   */
  send(data: EyeTrackingData): void {
    super.send(JSON.stringify(data));
  }
}
