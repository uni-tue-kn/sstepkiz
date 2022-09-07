import { SensorApiModule, SensorDriver } from '@libs/sensor-api';
import { Module, Provider } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { LookDriver } from './drivers/look.driver';
import { LookConnectorService } from './types/look-connector.service';

/**
 * Defines drivers to provide and export.
 */
 const DRIVERS: Provider<SensorDriver>[] = [
  {
    provide: 'Look',
    useClass: LookDriver,
  },
];

@Module({
  exports: [
    ...DRIVERS,
    LookConnectorService
  ],
  imports: [
    HttpModule,
    SensorApiModule,
  ],
  providers: [
    ...DRIVERS,
    LookConnectorService,
  ],
})
export class LookModule {}
