import { SensorDriver } from '@libs/sensor-api';
import { Module, Provider } from '@nestjs/common';

import { MovesenseEcgDriver } from './drivers/movesense.driver';
import { MovesenseMovDriver } from './drivers/movesense-mov.driver';

/**
 * Defines drivers to provide and export.
 */
const DRIVERS: Provider<SensorDriver>[] = [{
  provide: 'MovesenseMov',
  useClass: MovesenseMovDriver
},
{
  provide: 'MovesenseEcg',
  useClass: MovesenseEcgDriver
}];

@Module({
  exports: DRIVERS,
  providers: DRIVERS,
})
export class MovesenseModule {}
