import { SensorPropertyState } from "@sstepkiz";

export interface SensorEventMap {
  'data': [...data: any[]];
  'error': [message: string, error: any | undefined];
  'calibratingStateChange': [state: SensorPropertyState];
  'calibrationStateChange': [calibrated: boolean];
  'configurationStateChange': [state: SensorPropertyState];
  'connectionStateChange': [state: SensorPropertyState];
  'initializationStateChange': [state: SensorPropertyState];
  'message': [channel: string, message: any];
  'recordingStateChange': [state: SensorPropertyState];
  'streamingStateChange': [state: SensorPropertyState];
  'track': [label: string, track: MediaStreamTrack];
};
