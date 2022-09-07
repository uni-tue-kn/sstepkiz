import { SensorConfiguration } from './sensor/sensor-configuration.interface';

export interface SensorDriverConfiguration {
  /**
   * Mapping from sensor type to drivers.
   */
  [sensorType: string]: {
    /**
     * Mapping from driver name to driver's configuration.
     */
    [driverName: string]: SensorConfiguration;
  };
}
