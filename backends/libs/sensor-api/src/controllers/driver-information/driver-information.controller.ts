import { Controller, Get } from '@nestjs/common';
import { SensorInfo } from '@sstepkiz';

import { DriverService } from '../../services/driver/driver.service';

@Controller('sensors')
export class DriverInformationController {

  /**
   * Constructs a new Controller to get information about sensor drivers.
   * @param driverService Driver Service instance.
   */
  constructor(private readonly driverService: DriverService) {}

  /**
   * Gets information about configured sensor drivers.
   * @returns Information about configured sensor drivers.
   */
  @Get()
  getDrivers(): SensorInfo[] {
    const drivers = this.driverService.getDrivers();
    return drivers.map(driver => ({
      channels: Object.getOwnPropertyNames(driver.channelDescriptions?.dataChannels ?? {}),
      driver: driver.name,
      id: driver.id,
      tracks: Object.getOwnPropertyNames(driver.channelDescriptions?.mediaChannels ?? {}),
      type: driver.type
    }));
  }
}
