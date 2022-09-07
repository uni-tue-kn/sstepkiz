import { AuthService } from '@libs/client-auth';
import { RtcSenderService } from '@libs/rtc-sender';
import { DriverService } from 'libs/sensor-api/src';
import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../../app-config/services/app-config/app-config.service';

@Injectable()
export class AppService {

  /**
   * Constructs a new app service.
   * @param authService Authentication Service instance.
   * @param configService Configuration Synchronization Service instance.
   * @param driverService Driver Service instance.
   * @param rtcService RTC sender Service instance.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly configService: AppConfigService,
    private readonly driverService: DriverService,
    private readonly rtcService: RtcSenderService,
  ) {}

  /**
   * Initializes the start routine.
   */
  async main(): Promise<void> {
    // Request authentication.
    try {
      await this.authService.authenticate();
    } catch (error) {
      throw `Failed to authenticate to authorization server ${(await this.configService.getAuthOptions()).issuer}: ${error}`
    }
    // Initialize sensor drivers.
    await this.driverService.initializeDrivers();
    // Connect to signalling server.
    await this.rtcService.connect();
  }
}
