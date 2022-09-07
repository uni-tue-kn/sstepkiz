import { Channel } from "./channel.class";
import { RxChannelEvent } from "./rx-channel-event.type";

export abstract class RxChannel extends Channel {

  /**
   * Constructs a new RTCDataChannel wrapper for receiving data.
   * @param userId Identity of user that this channel is connected to.
   * @param channel RTC Data Channel instance.
   */
  constructor(userId: string, protected readonly channel: RTCDataChannel) {
    super(userId);
    // Subscribe received message.
    this.channel.addEventListener('message', async (ev: MessageEvent) => {
      this.eventEmitter.emit('message', await this.parseData(ev))
    });
    this.subscribeEvents();
  }

  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  addListener(event: RxChannelEvent, callback: (data: any) => void): void {
    this.eventEmitter.addListener(event, callback);
  }

  /**
   * Parses the event of received message to preferred data format.
   * @param ev Event of received message.
   */
  protected async parseData(ev: MessageEvent): Promise<any> {
    return ev.data;
  }

  /**
   * Removes an event listener.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  removeListener(event: RxChannelEvent, callback: (data: any) => void): void {
    this.eventEmitter.removeListener(event, callback);
  }
}
