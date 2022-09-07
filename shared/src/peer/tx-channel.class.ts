import { Channel } from "./channel.class";
import { DEFAULT_CHANNEL_OPTIONS } from "./default-channel-options";
import { TxChannelEvent } from "./tx-channel-event.type";

export abstract class TxChannel extends Channel {

  /**
   * RTC Data channel instance.
   */
  protected readonly channel: RTCDataChannel;

  /**
   * Listener for data event of corresponding sensor.
   */
  readonly dataListener = (data: any): void => this.send(data);

  /**
   * Constructs a new Sender Channel.
   * @param userId Identity of user that this channel is connected to.
   * @param peerConnection Conneciton to remote peer..
   * @param label Label of channel.
   * @param options Optional options connection for channel.
   */
  constructor(userId: string, protected readonly peerConnection: RTCPeerConnection, label: string, options: RTCDataChannelInit = DEFAULT_CHANNEL_OPTIONS) {
    super(userId);
    // Create channel.
    this.channel = peerConnection.createDataChannel(label, options);
    this.subscribeEvents();
  }

  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param callback Listener callback to add.
   */
  addListener(event: TxChannelEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.addListener(event, callback);
  }

  /**
   * Removes an event listener.
   * @param event Name of event.
   * @param callback Listener callback to add.
   */
  removeListener(event: TxChannelEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.removeListener(event, callback);
  }

  /**
   * Sends data through the channel.
   * @param data Data to send.
   */
  send(data: any): void {
    try {
      this.channel.send(data);
    } catch (error) {
      throw `Failed to send data "${JSON.stringify(data)}" to channel of type "${this.type}": ${error}`;
    }
  }
}
