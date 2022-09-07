import { AuthOptions } from '@libs/auth';
import { DatabaseOptions } from '@libs/db';
import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DEFAULT_LOG_LEVEL, DEFAULT_PORT } from '../environment';

@Global()
@Injectable()
export class AppConfigService {
  /**
   * OpenID Connect configuration.
   */
  readonly auth: AuthOptions;

  private databaseOptions: DatabaseOptions;
  /**
   * Database configuration.
   */
  async getDatabaseOptions(): Promise<DatabaseOptions> {
    if (!this.databaseOptions) {
      this.databaseOptions = await DatabaseOptions.fromConfigFile(
        this.configService,
      );
    }
    return this.databaseOptions;
  }

  /**
   * Level of logging.
   */
  logLevel: number;

  /**
   * Port to listen on connections.
   */
  port: number;

  /**
   * Constructs a new configuration for the Signalling Server.
   * @param configService Configuration service.
   */
  constructor(private readonly configService: ConfigService) {
    this.auth = AuthOptions.fromConfigFile(configService);
    this.logLevel = configService.get<number>('LOG_LEVEL', DEFAULT_LOG_LEVEL);
    this.port = configService.get<number>('PORT', DEFAULT_PORT);
  }
}
