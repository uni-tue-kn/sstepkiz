import { SensorData } from "../sensor-data.interface";

export interface EdaData extends SensorData {
  /**
   * Point in time of the measurement.
   */
  t: number;
  
  /**
   * Eda measurent value.
   */
  edaValue: number;
}
