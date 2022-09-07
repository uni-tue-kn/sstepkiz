import { validate } from 'class-validator';

import { ChannelType } from "../../peer/channel-type.enum";
import { RxChannel } from "../../peer/rx-channel.class";
import { RxChannelEvent } from "../../peer/rx-channel-event.type";
import { EyeTrackingDataDto } from './eyetracking-data.dto';
import { EyeTrackingData } from "./eyetracking-data.interface";

export class EyeTrackingRxChannel extends RxChannel {

  /**
   * The type of the channel.
   */
  readonly type: ChannelType = ChannelType.eyetracking;

  /**
   * Constructs a new EDA RX-Channel.
   * @param userId Identity of user that this channel is connected to.
   * @param channel RTC Data Channel instance.
   * @param track Field camera video track.
   */
  constructor(userId: string, channel: RTCDataChannel, readonly track: MediaStreamTrack) {
    super(userId, channel);
  }

  /**
   * Adds a new event listener.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  addListener(event: RxChannelEvent, callback: (data: EyeTrackingData) => void): void {
    this.eventEmitter.addListener(event, callback);
  }

  /**
   * Parses the event of received message to preferred data format.
   * @param ev Event of received message.
   * @returns Validated and parsed eye tracking data.
   */
  protected async parseData(ev: MessageEvent): Promise<EyeTrackingData> {
    const parsed = JSON.parse(ev.data);
    const data = Object.assign(new EyeTrackingDataDto(), parsed);
    const errors = await validate(data);
    if (errors.length > 0) throw 'Validation failed';
    return data as EyeTrackingData;
  }

  /**
   * Removes an event listener.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  removeListener(event: RxChannelEvent, callback: (data: EyeTrackingData) => void): void {
    this.eventEmitter.addListener(event, callback);
  }
}
