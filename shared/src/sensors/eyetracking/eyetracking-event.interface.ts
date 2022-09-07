import { EyeTrackingData } from "./eyetracking-data.interface";

export interface EyeTrackingEvent {

  /**
   * Event data.
   */
  data: EyeTrackingData | MediaStreamTrack;

  /**
   * Time of data.
   * For synchronization purposes.
   * 0 = No synchronization needed.
   */
  t: number;

  /**
   * Type of event data.
   */
  type: 'data' | 'track';
}
