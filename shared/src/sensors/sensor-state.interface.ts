import { SensorCapabilities } from "./sensor-capabilities.interface";

export type SensorPropertyState = 'starting' | 'running' | 'stopping' | 'stopped' | 'failed';

export interface SensorState {
  capabilities?: SensorCapabilities;
  calibrating?: SensorPropertyState;
  calibration?: boolean;
  configuration?: SensorPropertyState;
  connection?: SensorPropertyState;
  initialization?: SensorPropertyState;
  recording?: SensorPropertyState;
  streaming?: SensorPropertyState;
}
