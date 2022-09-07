import { ModuleMetadata } from '@nestjs/common/interfaces';
import { RtcConfig } from '@sstepkiz';

export interface RtcSenderModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  global?: boolean;
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<RtcConfig> | RtcConfig;
}
