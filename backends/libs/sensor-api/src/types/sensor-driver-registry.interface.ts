export interface SensorDriverRegistry {
  [sensorType: string]: { [driverName: string]: any };
}
