export interface SensorCapabilities {
  calibratable?: boolean;
  configurable?: boolean;
  connectable?: boolean;
  recordable?: boolean;
  streamable?: boolean;
  requiresStreamingRestart?: boolean;
}
