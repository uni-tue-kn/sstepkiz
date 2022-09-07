import { readSecret } from 'libs/common/src';

export class DatabaseOptions {
  /**
   * Name of database.
   */
  readonly database: string = 'sstepkiz';

  /**
   * Prefix before table names.
   */
  readonly entityPrefix: string = '';

  /**
   * Host of database.
   */
  readonly host: string = 'localhost';

  /**
   * Password for database.
   */
  readonly password: string = '';

  /**
   * Port of database.
   */
  readonly port: number = 5432;

  /**
   * Username for database.
   */
  readonly username: string = 'postgres';

  /**
   * Constructs new database options.
   * @param options Options to apply.
   */
  constructor(options: Partial<DatabaseOptions>) {
    Object.assign(this, options);
  }

  /**
   * Loads the database options from configuration.
   * @param configService Configuration service.
   * @returns Loaded database options.
   */
  static async fromConfigFile(configService: {
    get: <T>(propertyPath: string, defaultValue?: T) => T;
  }): Promise<DatabaseOptions> {
    const [username, password, database] = await Promise.all([
      readSecret(configService, 'DB_USER'),
      readSecret(configService, 'DB_PASS'),
      readSecret(configService, 'DB_NAME'),
    ]);
    return new DatabaseOptions({
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      username,
      password,
      database,
      entityPrefix: configService.get<string>('DB_PREFIX'),
    });
  }
}
