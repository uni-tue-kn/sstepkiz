import { validate } from 'class-validator';

import { ChannelType } from "../../peer/channel-type.enum";
import { RxChannel } from "../../peer/rx-channel.class";
import { RxChannelEvent } from "../../peer/rx-channel-event.type";
import { MovementDataDto } from './movement-data.dto';
import { MovementData } from "./movement-data.interface";

export class MovementRxChannel extends RxChannel {

  /**
   * The type of the channel.
   */
  readonly type: ChannelType = ChannelType.movement;

  /**
   * Constructs a new Movement RX-Channel.
   * @param userId Identity of user that this channel is connected to.
   * @param channel RTC Data Channel instance.
   */
  constructor(userId: string, channel: RTCDataChannel) {
    super(userId, channel);
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
   * @returns Validated and parsed movement data.
   */
  protected async parseData(ev: MessageEvent): Promise<MovementData> {
    const parsed = JSON.parse(ev.data);
    const data = Object.assign(new MovementDataDto(), parsed);
    const errors = await validate(data);
    if (errors.length > 0) throw 'Validation failed: ' + JSON.stringify(errors);
    return data as MovementData;
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
