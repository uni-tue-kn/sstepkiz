import { ClientAuthModule } from '@libs/client-auth';
import { LoggerModule } from '@libs/logger';
import { RtcSenderModule } from '@libs/rtc-sender';
import { SensorApiModule } from '@libs/sensor-api';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/services/app-config/app-config.service';
import { DRIVERS, DRIVER_MODULES } from './driver-modules';
import { SENSOR_CONFIG_FILE } from './environment';
import { AppService } from './services/app/app.service';

@Module({
  imports: [
    AppConfigModule,
    ClientAuthModule.forRootAsync({
      global: true,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (config: AppConfigService) =>
        await config.getAuthOptions(),
    }),
    LoggerModule,
    RtcSenderModule.forRootAsync({
      global: true,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => config.rtc,
    }),
    SensorApiModule.forRoot({
      driverModules: DRIVER_MODULES,
      driverConfiguration: SENSOR_CONFIG_FILE,
      driverRegistry: DRIVERS,
      global: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(
        __dirname,
        'client',
      ),
    }),
  ],
  providers: [
    AppConfigService,
    AppService
  ]
})
export class AppModule {}
