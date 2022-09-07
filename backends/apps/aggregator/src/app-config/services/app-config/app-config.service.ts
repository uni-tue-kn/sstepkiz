import { AuthOptions } from '@libs/client-auth';
import { Injectable, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeviceType,
  EventEmitter,
  RtcConfig,
} from '../../../../../../../shared/dist';

import {
  DEFAULT_LOG_LEVEL,
  DEFAULT_PORT,
} from '../../../environment';

@Global()
@Injectable()
export class AppConfigService {
  /**
   * OpenID Connect configuration.
   */
  private authOptions: AuthOptions = undefined;
  async getAuthOptions(): Promise<AuthOptions> {
    if (!this.authOptions) {
      this.authOptions = await AuthOptions.fromConfigFile(this.configService);
    }
    return this.authOptions;
  }

  /**
   * Event emitter.
   */
  private readonly emitter = new EventEmitter();

  /**
   * Level of logging.
   */
  readonly logLevel: number;

  /**
   * Port to listen on connections.
   */
  readonly port: number;

  /**
   * RTC configuration.
   */
  readonly rtc: RtcConfig;

  /**
   * Constructs a new Application Configuration Service.
   * @param configService Configuration Service instance.
   */
  constructor(private readonly configService: ConfigService) {
    this.logLevel = configService.get<number>('LOG_LEVEL', DEFAULT_LOG_LEVEL);
    this.port = configService.get<number>('PORT', DEFAULT_PORT);
    this.rtc = this.createRtcConfig(configService);
  }

  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param listener Listener callback to add.
   */
  addListener(event: 'configChange', listener: () => void): void {
    this.emitter.addListener(event, listener);
  }

  /**
   * Loads RTC configuration from configuration.
   * @param configService Configuration service.
   * @returns Loaded RTC configuration.
   */
  private createRtcConfig(configService: ConfigService): RtcConfig {
    return {
      stunServers: configService.get<string>('STUN_SERVERS', '').split(','),
      turnServers: configService.get<string>('TURN_SERVERS', '').split(','),
      mode: DeviceType.Sender,
      signallingServerUrl: configService.get<string>('SIGNALLING_SERVER', ''),
    };
  }

  /**
   * Removes a listener callback from an event.
   * @param event Name of event.
   * @param listener Listener callback to remove.
   */
  removeListener(event: 'configChange', listener: () => void): void {
    this.emitter.removeListener(event, listener);
  }
}
