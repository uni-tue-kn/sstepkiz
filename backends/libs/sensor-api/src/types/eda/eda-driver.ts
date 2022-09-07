import { LoggerService } from '@libs/logger';
import { Injectable } from '@nestjs/common';
import { SensorCapabilities } from '../../../../../../shared/dist';

import { SensorDriver, SensorDrivers } from '../sensor/sensor-driver';

@Injectable()
export abstract class EdaDriver extends SensorDriver {

  /**
   * Constructs a new EDA driver.
   * @param name Name of sensor driver.
   * @param capabilities Capabilities of the sensor driver.
   */
   constructor(name: string, capabilities: SensorCapabilities, logger: LoggerService) {
    super(name, capabilities, logger, 'eda');
  }
}

@Injectable()
export class EdaDrivers extends SensorDrivers<EdaDriver> {}
