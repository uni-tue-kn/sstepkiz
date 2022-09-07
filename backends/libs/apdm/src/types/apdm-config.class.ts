import { UdpChannelConfig } from "@libs/udp-connector";
import { ConfigService } from "@nestjs/config";
import { SocketType } from "dgram";

const APDM_CHANNEL_DEFAULT_HOST: string = '127.0.0.1';
const APDM_CHANNEL_DEFAULT_TYPE: SocketType = 'udp4';
const APDM_CHANNEL_DEFAULT_PORT: number = 5000;
const APDM_CHANNEL_NAME: string = 'apdm';
const APDM_DEFAULT_CONFIG_FILE: string = './apdm-config.json';
const APDM_DEFAULT_CONFIG_PARAMS: string = '-jar ./apdm-server.jar -c ./apdm-config.json';
const APDM_DEFAULT_INIT_PARAMS: string = '-jar ./apdm-server.jar -s 127.0.0.1:5000';
const APDM_DEFAULT_CONVERT_PARAMS: string = '-jar ./apdm-server.jar -p';
const APDM_DEFAULT_SERVER_APP: string = 'java';
const APDM_DEFAULT_BACKUP_INTERVAL: number = 5000;
const APDM_DEVICE_UPDATE_INTERVAL: number = 3000;
const APDM_SERVER_RESTART_TIMEOUT: number = 5000;
const APDM_DEFAULT_DELETE_RAW: boolean = true;

export class ApdmConfig {

  /**
   * Gets the interval in ms to check for not backed up files.
   */
  get backupInterval(): number {
    return this.configService.get<number>('DRIVER_APDM_BACKUP_INTERVAL', APDM_DEFAULT_BACKUP_INTERVAL);
  }

  /**
   * Gets the configuration of the UDP Channel.
   */
  get channelConfig(): UdpChannelConfig {
    return {
      host: this.configService.get<string>('DRIVER_APDM_LISTENER_HOST', APDM_CHANNEL_DEFAULT_HOST),
      ipType: this.configService.get<SocketType>('DRIVER_APDM_LISTENER_TYPE', APDM_CHANNEL_DEFAULT_TYPE),
      name: APDM_CHANNEL_NAME,
      port: this.configService.get<number>('DRIVER_APDM_LISTENER_PORT', APDM_CHANNEL_DEFAULT_PORT)
    };
  }

  /**
   * Gets the configured configuration file.
   */
  get configFile(): string {
    return this.configService.get<string>('DRIVER_APDM_CONFIG_FILE', APDM_DEFAULT_CONFIG_FILE);
  }

  /**
   * Gets if raw files should be deleted after successful conversion.
   */
  get deleteRaw(): boolean {
    return this.configService.get<boolean>('DRIVER_APDM_DELETE_RAW', APDM_DEFAULT_DELETE_RAW);
  }

  /**
   * Gets the interval in ms to search for connected devices.
   */
  get deviceUpdateInterval(): number {
    return this.configService.get<number>('DRIVER_APDM_DEVICE_UPDATE_INTERVAL', APDM_DEVICE_UPDATE_INTERVAL);
  }

  /**
   * Gets the name of the configured APDM Server application.
   */
  get serverApplication(): string {
    return this.configService.get<string>('DRIVER_APDM_SERVER_APP', APDM_DEFAULT_SERVER_APP);
  }

  /**
   * Gets the configured parameters to configured the sensors using the APDM Server application.
   */
  get serverConfigParams(): string[] {
    return this.configService.get<string>('DRIVER_APDM_CONFIG_PARAMS', APDM_DEFAULT_CONFIG_PARAMS).split(' ');
  }

  /**
   * Gets parameters for conversion of raw files.
   */
  get serverConvertParams(): string[] {
    return this.configService.get<string>('DRIVER_APDM_CONVERT_PARAMS', APDM_DEFAULT_CONVERT_PARAMS).split(' ');
  }

  /**
   * Gets the configured parameters to start streaming of sensor data using the APDM Server application.
   */
  get serverInitParams(): string[] {
    return this.configService.get<string>('DRIVER_APDM_INIT_PARAMS', APDM_DEFAULT_INIT_PARAMS).split(' ');
  }

  /**
   * Gets the number of ms to wait until restart of APDM Server in case of failure.
   */
  get serverRestartTimeout(): number {
    return this.configService.get<number>('DRIVER_APDM_SERVER_RESTART_TIMEOUT', APDM_SERVER_RESTART_TIMEOUT)
  }

  /**
   * Constructs a new APDM configuration.
   * @param configService Configuration Service instance.
   */
  constructor(private readonly configService: ConfigService) {}
}
