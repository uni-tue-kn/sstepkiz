import { DbModule } from '@libs/db/db.module';
import { Module } from '@nestjs/common';
import { GameLogicController } from './controllers/game-logic.controller';
import { GameLogicService } from './services/game-logic.service';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';
import { UserGameSheet } from './entities/user-game-sheet.entity';
import { UserGameSheetTitle } from './entities/user-game-sheet-title.entity';
import { UserGameSheetEntertMaps } from './entities/user-game-sheet-entert-maps.entity';
import { UserGameSheetPurchasedClothes } from './entities/user-game-sheet-purchased-clothes.entity';

const ENTITY_TYPES = [
  UserGameSheet,
  UserGameSheetTitle,
  UserGameSheetEntertMaps,
  UserGameSheetPurchasedClothes,
];

@Module({
  controllers: [GameLogicController],
  imports: [
    DbModule.forRootAsync({
      global: true,
      entityTypes: ENTITY_TYPES,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (config: AppConfigService) => ({
        entities: ENTITY_TYPES,
        synchronize: true,
        type: 'postgres',
        uuidExtension: 'pgcrypto',
        ...(await config.getDatabaseOptions()),
      }),
    }),
  ],

  providers: [GameLogicService],
})
export class GameLogicModule {}
