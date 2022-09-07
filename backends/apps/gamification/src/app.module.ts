import { AuthModule } from '@libs/auth';
import { LoggerModule } from '@libs/logger';
import { Module } from '@nestjs/common';

import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app/app.controller';
import { GameLogicModule } from './game-logic/game-logic.module';



@Module({
  imports: [
    AppConfigModule,
    AuthModule.forRootAsync({
      global: true,
      imports: [AppConfigModule, LoggerModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => config.auth,
    }),
    GameLogicModule
  ],
  controllers: [AppController],
})
export class AppModule {}
