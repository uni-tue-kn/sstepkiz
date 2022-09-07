import { LoggerService } from '@libs/logger';
import { Injectable } from '@nestjs/common';
import { SensorCapabilities } from '../../../../../../shared/dist';

import { SensorDriver, SensorDrivers } from '../sensor/sensor-driver';

@Injectable()
export abstract class EcgDriver extends SensorDriver {

  /**
   * Constructs a new ECG driver.
   * @param name Name of sensor driver.
   * @param capabilities Capabilities of the sensor driver.
   */
  constructor(name: string, capabilities: SensorCapabilities, logger: LoggerService) {
    super(name, capabilities, logger, 'ecg');
  }
}

@Injectable()
export class EcgDrivers extends SensorDrivers<EcgDriver> {}
