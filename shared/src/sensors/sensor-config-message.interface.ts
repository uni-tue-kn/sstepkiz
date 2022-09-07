import { SensorState } from "./sensor-state.interface";

export type SensorCommand = 'configure' | 'connect' | 'disconnect' | 'initialize' | 'reset' | 'startCalibrating' | 'startRecord' | 'startStreaming' | 'stopCalibrating' | 'stopRecord' | 'stopStreaming' | 'terminate';

export interface SensorConfigCommandMessage {
  command: SensorCommand;
  type: 'cmd';
}

export interface SensorConfigStateMessage {
  state: SensorState;
  type: 'state';
}

export type SensorConfigMessage = SensorConfigCommandMessage | SensorConfigStateMessage;
