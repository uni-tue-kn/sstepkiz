import { AuthModule } from '@libs/auth';
import { LoggerModule } from '@libs/logger';
import { Module } from '@nestjs/common';

import { AppController } from './controllers/app.controller';
import { AppConfigService } from './config/app-config.service';
import { AppConfigModule } from './config/app-config.module';
import { SocketModule } from './socket/socket.module';

@Module({
  controllers: [AppController],
  imports: [
    AppConfigModule,
    AuthModule.forRootAsync({
      global: true,
      imports: [
        AppConfigModule,
        LoggerModule,
      ],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => config.auth,
    }),
    LoggerModule,
    SocketModule,
  ],
})
export class AppModule {}
