import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CONFIG_FILE } from '../environment';
import { AppConfigService } from './app-config.service';

@Module({
  exports: [AppConfigService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: CONFIG_FILE,
      isGlobal: true,
    }),
  ],
  providers: [AppConfigService],
})
export class AppConfigModule {}
