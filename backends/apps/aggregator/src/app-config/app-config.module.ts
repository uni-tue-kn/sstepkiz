import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { CONFIG_FILE, CONFIG_FILE_EXISTS } from '../environment';
import { AppConfigService } from './services/app-config/app-config.service';

/**
 * Options for configuration module depending on the existence of the configuration file.
 */
const CONFIG_MODULE_OPTIONS = CONFIG_FILE_EXISTS
  ? {
      envFilePath: CONFIG_FILE,
      isGlobal: true,
    }
  : {
      ignoreEnvFile: true,
      ignoreEnvVars: false,
      isGlobal: true,
    };

@Module({
  exports: [AppConfigService],
  imports: [
    ConfigModule.forRoot(CONFIG_MODULE_OPTIONS),
    HttpModule,
  ],
  providers: [AppConfigService],
})
export class AppConfigModule {}
