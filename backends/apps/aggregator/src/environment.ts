import { SensorDriverConfiguration } from '@libs/sensor-api';
import fs from 'fs';

/**
 * Indicates if software runs in development mode.
 */
export const DEV_MODE = process.env.NODE_ENV === 'dev';

/**
 * Name of default configuration file.
 */
export const CONFIG_FILE = `aggregator-config${DEV_MODE ? '.dev' : ''}.env`;

/**
 * Gets if CONFIG_FILE exists.
 */
export const CONFIG_FILE_EXISTS = fs.existsSync(CONFIG_FILE);

/**
 * Name of sensor configuration file.
 */
export const SENSOR_CONFIG_FILE_NAME = 'sensor-configuration.json';

/**
 * Sensor configuration.
 */
export const SENSOR_CONFIG_FILE: SensorDriverConfiguration = JSON.parse(
  fs.readFileSync(SENSOR_CONFIG_FILE_NAME).toString(),
);

/**
 * Default log level.
 */
export const DEFAULT_LOG_LEVEL = 0;

/**
 * Default port.
 */
export const DEFAULT_PORT = 3000;
