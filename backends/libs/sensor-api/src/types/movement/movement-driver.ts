import { LoggerService } from '@libs/logger';
import { Injectable } from '@nestjs/common';
import { SensorCapabilities } from '../../../../../../shared/dist';

import { SensorDriver, SensorDrivers } from '../sensor/sensor-driver';

@Injectable()
export abstract class MovementDriver extends SensorDriver {

  /**
   * Constructs a new movement driver.
   * @param name Name of sensor driver.
   * @param capabilities Capabilities of the sensor driver.
   * @param logger Logger Service instance.
   */
  constructor(name: string, capabilities: SensorCapabilities, logger: LoggerService) {
    super(name, capabilities, logger, 'mov');
  }
}

@Injectable()
export class MovementDrivers extends SensorDrivers<MovementDriver> {}
