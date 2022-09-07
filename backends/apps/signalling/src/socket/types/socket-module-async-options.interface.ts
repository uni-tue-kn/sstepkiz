import { DatabaseOptions } from '@libs/db';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface SocketModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<DatabaseOptions> | DatabaseOptions;
}
