import { LoggerService } from '@libs/logger';
import { ConfigChannelDescription, MovementDriver, SensorDataService, SensorDriverInfo, TimeConverter } from '@libs/sensor-api';
import { UdpConnectorService } from '@libs/udp-connector';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MovementData } from '@sstepkiz';
import * as fs from 'fs';
import * as path from 'path';

import { ApdmBackupManager } from '../types/apdm-backup-manager.class';
import { ApdmConfig } from '../types/apdm-config.class';
import { ApdmDevice } from '../types/apdm-device.interface';
import { ApdmDeviceManager } from '../types/apdm-device-manager.class';
import { ApdmFileConverterService } from '../types/apdm-file-converter.service';
import { ApdmServerManager } from '../types/apdm-server-manager.class';
import { ApdmDriverConfiguration } from './apdm-driver-configuration.class';

/**
 * Frequency of samples to log in debug output.
 */
const DEBUG_SAMPLES = 500;

@Injectable()
export class ApdmDriver extends MovementDriver {

  /**
   * Handles backups.
   */
  private readonly backup: ApdmBackupManager;

  /**
   * Description of required channels.
   */
  readonly channelDescriptions = {
    dataChannels: {
      'config': ConfigChannelDescription(this)
    }
  };

  /**
   * Configuration of APDM driver.
   */
  private readonly config: ApdmConfig;

  /**
   * Configuration of the APDM driver to apply when configuring.
   */
  configuration: ApdmDriverConfiguration;

  /**
   * Packet counter for statistics.
   */
  private dataCount: number = 0;

  /**
   * Path to stored data.
   */
  private dataPath?: string = undefined;

  /**
   * Path to temporary store raw data.
   */
  private tempDataPath?: string = undefined;

  /**
   * Handles devices.
   */
  private readonly deviceManager: ApdmDeviceManager;

  /**
   * Gets the APDM devices.
   */
  get devices(): ApdmDevice[] {
    return this.deviceManager.devices;
  }

  /**
   * Indicates if streaming should be restarted after configuration.
   */
  private restartStreaming: boolean = false;

  /**
   * Handles APDM Server process.
   */
  private readonly server: ApdmServerManager;

  /**
   * Handles received messages.
   * @param msg Received message buffer.
   */
  private readonly onMessage = (msg: Buffer) => {
    const message = msg.toString('utf8');
    try {
      // Parse data.
      const data = (JSON.parse(message).map(d => { d.id = `${d.id}`; return d; })) as MovementData[];
      if (data.length === 0) {
        return;
      }
      // Update statistics and debugging output.
      this.dataCount++;
      if (this.dataCount % DEBUG_SAMPLES === 1) {
        this.loggerService.debug(`APDM data sample to forward #${this.dataCount}: ${JSON.stringify(data)}`, this.constructor.name);
      }
      // Emit parsed data.
      this.emit('data', ...data).catch((error: any) => {
        this.loggerService.error(`Failed to emit APDM sensor data: ${error}`, this.constructor.name);
      });
    } catch (error) {
      this.loggerService.error(`Failed to parse APDM sensor data message "${message}": ${error}`, this.constructor.name);
    }
  };

  /**
   * Stream to write start and end timestamp of a recording.
   */
  private writeStream?: fs.WriteStream;

  /**
   * Constructs a new APDM sensor driver.
   * @param configService Configuration Service instance.
   * @param loggerService Logger Service instance.
   * @param sensorDataService Sensor Data Service instance.
   * @param sensorDriverInfo Sensor Driver information.
   * @param udpConnectorService UDP Connector Service instance.
   */
  constructor(
    configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly sensorDataService: SensorDataService,
    sensorDriverInfo: SensorDriverInfo,
    private readonly udpConnectorService: UdpConnectorService,
  ) {
    super('Apdm',
      {
        calibratable: true,
        recordable: true,
        streamable: (sensorDriverInfo.config['mov']['Apdm'] as ApdmDriverConfiguration)?.streaming ?? false
      },
      loggerService,
    );
    this.configuration = sensorDriverInfo.config[this.type][this.name] as ApdmDriverConfiguration;
    this.config = new ApdmConfig(configService);
    this.backup = new ApdmBackupManager(this.loggerService, this.configuration, new ApdmFileConverterService(this.config, loggerService));
    this.deviceManager = new ApdmDeviceManager();
    this.server = new ApdmServerManager(this.config, this.loggerService);
  }

  protected async _configure(): Promise<void> {
    // Nothing to do here!
  }

  /**
   * Initializes the APDM sensors.
   */
  protected async _initialize(): Promise<void> {
    // Register sensor data path.
    try {
      this.loggerService.debug(`Registering APDM Sensor Data...`, this.constructor.name);
      this.dataPath = await this.sensorDataService.register('apdm');
      this.tempDataPath = await this.sensorDataService.register('apdm_raw');
    } catch (error) {
      this.loggerService.error(`Failed to register APDM Sensor Data: ${error}`, this.constructor.name);
      this.loggerService.warn('APDM Sensor data cannot be logged!', this.constructor.name);
    }

    // Initialize APDM device updates.
    this.loggerService.debug(`Initializing APDM device update interval of ${this.config.deviceUpdateInterval} ms ...`, this.constructor.name);
    await this.deviceManager.startWatching(this.config.deviceUpdateInterval);

    // Initialize Backup manager.
    if (this.dataPath) {
      this.loggerService.debug(`Initializing APDM backup interval of ${this.config.backupInterval} ms to backup directory of ${this.dataPath} ...`, this.constructor.name);
      this.backup.startWatching(this.tempDataPath, this.dataPath, this.devices, this.config.backupInterval, async (options) => {
        this.configuration = options;
        await this.startCalibrating();
        await this.stopCalibrating();
      });
    } else {
      this.loggerService.error('Failed to start APDM backup interval! Invalid data path', this.constructor.name);
      this.loggerService.warn('APDM Sensor data backup not running', this.constructor.name);
    }
  }
  /**
   * Terminates the APDM driver.
   */
  protected async _terminate(): Promise<void> {
    this.loggerService.debug('Terminating APDM device update interval ...', this.constructor.name);
    this.deviceManager.stopWatching();

    this.loggerService.debug('Terminating APDM backup interval ...', this.constructor.name);
    this.backup.stopWatching();

    this.setCalibrationState(false);

    // Make sure that APDM Server process is stopped.
    this.loggerService.debug('Terminating APDM Server process ...', this.constructor.name);
    await this.server.stopStream();
    this.setConnectionState('stopped');
  }

  protected _connect(): void | Promise<void> {
    // No connecting.
    this.setConnectionState('running');
  }
  protected _disconnect(): void | Promise<void> {
    // No disconnecting.
  }

  /**
   * Configures the APDM sensors and synchronizes time.
   */
   protected async _startCalibrating(): Promise<void> {
    // Stop streaming if running.
    this.restartStreaming = this.restartStreaming || this.server.isStreaming;
    if (this.server.isStreaming) {
      this.loggerService.debug('Stopping APDM Sensor streaming for configuration...', this.constructor.name);
      await this.stopStreaming();
    }

    // Start configuration.
    this.loggerService.debug('Calibrating APDM sensors...', this.constructor.name);
    try {
      if (!this.server.isConfiguring) {
        await this.server.configure(this.configuration);
        this.setCalibrationState(true);
        this.setCalibratingState('stopped');
        // await this.stopCalibrating();
        this.loggerService.debug('APDM sensors calibrated', this.constructor.name);
      }
      // this.communicationService.sendMessage('Die Bewegungssensoren wurden erfolgreich konfiguriert und können nun angelegt werden.');
    } catch (error) {
      this.setCalibrationState(false);
      this.loggerService.error(error, this.constructor.name);
      this.setCalibrationState(false);
      this.setCalibratingState('failed');
      throw error;
      // this.communicationService.sendMessage(`Konfiguration der Bewegungssensoren fehlgeschlagen! Stelle sicher, dass die Bewegungssensoren eingesteckt sind und versuche es dann erneut. Mehr Infos im Log.`);
    }

    // Restart streaming if started previously.
    if (this.restartStreaming) {
      this.loggerService.debug('Restarting APDM sensor streaming...', this.constructor.name);
      this.startStreaming(); // Do not await since this is not part of the configure procedure!
      this.restartStreaming = false;
    }
  }
  /**
   * Stops calibration of APDM sensor.
   */
  protected _stopCalibrating(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Creates a recording note file and writes the current timestamp to it.
   */
  protected async _startRecording(): Promise<void> {
    // Ensure that data path is registered.
    if (!this.dataPath) throw 'Data path not registered! Initialize APDM driver first!';
    // Get the current date time.
    const now = new Date();
    // Generate the file path.
    const filename = `recording_${TimeConverter.getYYYYMMDDhhmmssuuuUTC(now)}.txt`;
    const filepath = path.join(this.dataPath, filename);
    // Create write stream.
    this.writeStream = fs.createWriteStream(filepath, { encoding: 'utf8' });
    // Write start date.
    await new Promise<void>((resolve, reject) => {
      this.writeStream.write(`${(now.getTime() + now.getTimezoneOffset() * 60 * 1000).toString()}\r\n`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
  /**
   * Writes the current timestamp to the recording note file and closes the file.
   */
  protected async _stopRecording(): Promise<void> {
    // Ensure that write stream exists.
    if (!this.writeStream) return;
    // Gets the current date time.
    const now = new Date();
    // Writes the end date to the file.
    await new Promise<void>((resolve, reject) => {
      this.writeStream.write((now.getTime() + now.getTimezoneOffset() * 60 * 1000).toString(), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    // Stops the write stream.
    await new Promise<void>((resolve) => {
      this.writeStream.end(() => {
        resolve();
      });
    });
    // Deletes the write stream instance.
    this.writeStream = undefined;
  }

  /**
   * Starts listening to APDM sensor data.
   */
  protected async _startStreaming(): Promise<void> {
    if (!this.capabilities.streamable) {
      return;
    }
    // Ensure that configuration process finished.
    if (this.server.isConfiguring) {
      this.loggerService.debug('Waiting for termination of configuration process and starting streaming afterwards...', this.constructor.name);
      await this.server.termination();
    }

    // Initialize data measuring.
    this.dataCount = 0;

    // Stop backup if running.
    if (this.backup.watching) {
      this.loggerService.debug(`Stopping APDM backup...`, this.constructor.name);
      this.backup.stopWatching();
    }

    // Start the UDP listener socket to await sensor data.
    this.loggerService.debug('Starting UDP Connector for APDM Server streaming ...', this.constructor.name);
    await this.udpConnectorService.on(this.config.channelConfig, this.onMessage);

    // Start sensors.
    this.loggerService.debug('Starting APDM streaming Server ...', this.constructor.name);
    await this.server.startStream();
    this.loggerService.debug('APDM streaming Server started', this.constructor.name);
  }
  /**
   * Stops listening to APDM sensor data.
   */
  protected async _stopStreaming(): Promise<void> {
    if (!this.capabilities.streamable) {
      return;
    }
    // Stop APDM Server.
    this.loggerService.debug('Stopping APDM streaming Server ...', this.constructor.name);
    await this.server.stopStream();

    // Stop the UDP listener socket.
    this.loggerService.debug('Stopping UDP Connector for APDM Server streaming ...', this.constructor.name);
    this.udpConnectorService.off(this.config.channelConfig.name, this.onMessage);
    this.loggerService.debug('UDP Connector for APDM Server streaming stopped', this.constructor.name);

    // Start backup interval.
    if (this.dataPath) {
      this.loggerService.debug(`Starting APDM sensor backup to ${this.dataPath}`, this.constructor.name);
      this.backup.startWatching(this.tempDataPath, this.dataPath, this.devices, this.config.backupInterval, async (options) => {
        this.configuration = options;
        await this.startCalibrating();
        await this.stopCalibrating();
      });
    } else {
      this.loggerService.error('Starting APDM sensor backup failed: Invalid data path', this.constructor.name);
      this.loggerService.warn(`APDM Sensor data backup will not run!`, this.constructor.name);
    }
  }
}
