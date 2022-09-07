import { LoggerService } from '@libs/logger';
import { Injectable } from '@nestjs/common';
import { SensorCapabilities } from '../../../../../../shared/dist';

import { SensorDriver, SensorDrivers } from '../sensor/sensor-driver';

@Injectable()
export abstract class EyeTrackingDriver extends SensorDriver {

  /**
   * Constructs a new eye tracking driver.
   * @param name Name of sensor driver.
   * @param capabilities Capabilities of the sensor driver.
   */
  constructor(name: string, capabilities: SensorCapabilities, logger: LoggerService) {
    super(name, capabilities, logger, 'etk');
  }
}

@Injectable()
export class EyeTrackingDrivers extends SensorDrivers<EyeTrackingDriver> {}
