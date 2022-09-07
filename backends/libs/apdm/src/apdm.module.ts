import { SensorDriver } from '@libs/sensor-api';
import { Module, Provider } from '@nestjs/common';

import { ApdmDriver } from './drivers/apdm.driver';

/**
 * Defines drivers to provide and export.
 */
const DRIVERS: Provider<SensorDriver>[] = [
  {
    provide: 'APDM',
    useClass: ApdmDriver,
  },
];

@Module({
  exports: DRIVERS,
  providers: DRIVERS,
})
export class ApdmModule {}
