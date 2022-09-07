import { SensorData } from "../sensor-data.interface";

export interface EyeTrackingData extends SensorData {
  /**
   * Confidence of gaze estimation.
   */
  c: number;

  /**
   * X position on field video.
   */
  x: number;

  /**
   * Y position on field video.
   */
  y: number;

  /**
   * Point in time of the measurement.
   */
  t: number;
}
