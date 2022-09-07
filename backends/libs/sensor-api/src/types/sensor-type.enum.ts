import { EcgDriver } from './ecg/ecg-driver';
import { EdaDriver } from './eda/eda-driver';
import { EyeTrackingDriver } from './eye-tracking/eye-tracking-driver';
import { MovementDriver } from './movement/movement-driver';
import { SensorDriver } from './sensor/sensor-driver';

export enum SensorType {
  /**
   * ECG sensor.
   */
  ecg = 'ecg',

  /**
   * EDA sensor.
   */
  eda = 'eda',

  /**
   * Eye tracking sensor.
   */
  etk = 'etk',

  /**
   * Movement sensor.
   */
  mov = 'mov',
}

/**
 * Gets the type of a SensorDriver by a SensorType.
 * @param type Sensor type to get driver type of.
 * @returns SensorDriver type of the SensorType or undefined if unknown.
 */
export function sensorTypeToDriverType(type: SensorType): typeof SensorDriver | undefined {
  switch (type) {
    case SensorType.ecg:
      return EcgDriver;
    case SensorType.eda:
      return EdaDriver;
    case SensorType.etk:
      return EyeTrackingDriver;
    case SensorType.mov:
      return MovementDriver;
    default:
      undefined;
  }
}
