import { SensorDriverConfiguration } from './sensor-driver-configuration.interface';
import { SensorDriverRegistry } from './sensor-driver-registry.interface';

export interface SensorApiModuleOptions {
  /**
   * Modules to load that inject sensor drivers.
   */
  driverModules?: any[];

  /**
   * Configuration of sensor drivers.
   */
  driverConfiguration?: SensorDriverConfiguration;

  /**
   * Sensor Driver registry.
   */
  driverRegistry?: SensorDriverRegistry;

  /**
   * If module is global.
   */
  global?: boolean;
}
