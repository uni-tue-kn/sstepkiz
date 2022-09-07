import { DynamicModule, Module } from '@nestjs/common';
import { RtcConfig } from '../../../../shared/dist';

import { RtcSenderService } from './services/rtc-sender.service';
import { RtcSenderModuleAsyncOptions } from './types/rtc-sender-module-async-options.interface';
import { IceApiService } from './services/ice-api.service';

@Module({
  exports: [RtcSenderService],
  providers: [RtcSenderService, IceApiService],
})
export class RtcSenderModule {
  /**
   * Generates the RtcSenderModule dynamically.
   * @param options Async options for RTC Sender Service.
   */
  static forRootAsync(options: RtcSenderModuleAsyncOptions): DynamicModule {
    return {
      global: options.global,
      imports: options.imports,
      module: RtcSenderModule,
      providers: [
        {
          inject: options.inject || [],
          provide: RtcConfig,
          useFactory: options.useFactory,
        },
      ],
    };
  }
}
