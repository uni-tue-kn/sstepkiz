import { ApdmDriver, ApdmModule } from '@libs/apdm';
import { LookDriver, LookModule } from '@libs/look';
import { MovesenseEcgDriver, MovesenseModule, MovesenseMovDriver } from '@libs/movesense';
import { SensorDriverRegistry } from '@libs/sensor-api';

export const DRIVER_MODULES = [
  ApdmModule,       // Driver module for APDM movement sensors.
  LookModule,       // Driver module for Look! Eye Tracking sensors.
  MovesenseModule,  // Driver module for Movesense sensors.
];

export const DRIVERS: SensorDriverRegistry = {
  // ECG Drivers:
  'ecg': {
    'MovesenseEcg': MovesenseEcgDriver,
  },

  // EDA Drivers:
  'eda': {},

  // Eye Tracking Drivers:
  'etk': {
    'Look': LookDriver,
  },

  // Movement Drivers:
  'mov': {
    'Apdm': ApdmDriver,
    'MovesenseMov': MovesenseMovDriver,
  },
};
