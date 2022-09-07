import { EventEmitter } from "../common/event-emitter.class";
import { ChannelType } from "./channel-type.enum";

export abstract class Channel {

  /**
   * RTC Data channel instance.
   */
  protected abstract readonly channel: RTCDataChannel;

  /**
   * Event emitter to emit events.
   */
  protected readonly eventEmitter: EventEmitter = new EventEmitter();

  /**
   * Channel ready state.
   */
  get state(): RTCDataChannelState {
    return this.channel.readyState;
  }

  /**
   * The type of the channel.
   */
  abstract readonly type: ChannelType;

  /**
   * Constructs a new channel.
   * @param userId Identity of user that this channel is connected to.
   */
  constructor(public readonly userId: string) {}

  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  abstract addListener(event: string, callback: (data: any) => void): void;

  /**
   * Closes the channel.
   */
  close(): void {
    this.channel.close();
  }

  /**
   * Removes an event listener.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  abstract removeListener(event: string, callback: (data: any) => void): void;

  /**
   * Removes all event listeners.
   */
  removeAllListeners(): void {
    this.eventEmitter.removeAllListeners();
  }

  /**
   * Subscribes basic listeners of channel connection.
   */
  protected subscribeEvents(): void {
    if (this.state === 'open') {
      this.eventEmitter.emit('connected');
    }
    this.channel.addEventListener('open', () => {
      this.eventEmitter.emit('connected')
    });
    this.channel.addEventListener('close', () => {
      // Ensure to close the channel correctly.
      this.close();
      this.eventEmitter.emit('closed');
    });
    this.channel.addEventListener('error', (ev: any) => {
      this.eventEmitter.emit('error', ev);
    });
  }
}
