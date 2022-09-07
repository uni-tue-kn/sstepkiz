import { AuthModule } from '@libs/auth';
import { DbModule } from '@libs/db';
import { LoggerModule } from '@libs/logger';
import { Module } from '@nestjs/common';

import { AppConfigModule } from '../config/app-config.module';
import { AppConfigService } from '../config/app-config.service';
import { PermissionsController } from './controllers/permissions/permissions.controller';
import { UsersController } from './controllers/users/users.controller';
import { Monitor } from './entities/monitor.entity';
import { Permissions } from './entities/permissions.entity';
import { Receiver } from './entities/receiver.entity';
import { Sender } from './entities/sender.entity';
import { Session } from './entities/session.entity';
import { User } from './entities/user.entity';
import { SignallingGateway } from './gateways/signalling.gateway';
import { PermissionService } from './services/permission/permission.service';
import { SocketService } from './services/socket/socket.service';
import { UserService } from './services/user/user.service';

const ENTITY_TYPES = [Monitor, Permissions, Receiver, Sender, Session, User];

@Module({
  controllers: [PermissionsController, UsersController],
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
  providers: [
    PermissionService,
    SignallingGateway,
    SocketService,
    UserService,
  ],
})
export class SocketModule {}
