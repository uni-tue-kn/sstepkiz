import { ModuleMetadata } from '@nestjs/common/interfaces';

import { AuthOptions } from './auth-options.class';

export interface AuthModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  global?: boolean;
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<AuthOptions> | AuthOptions;
}
