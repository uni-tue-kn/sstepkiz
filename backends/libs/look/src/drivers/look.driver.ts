import { LoggerService } from '@libs/logger';
import { ChannelDescriptionMap, ConfigChannelDescription, EyeTrackingDriver, SensorDataService, SensorDriverInfo, sleep } from '@libs/sensor-api';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EyeTrackingEvent } from '@sstepkiz';
import { copyFile, stat } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { LookConnectorService } from '../types/look-connector.service';
import { LookProcessHandler } from '../types/look-process-handler.class';

/**
 * Target directory of recorded Movesense Mov data.
 */
const STORAGE_DIRECTORY = 'etk';

@Injectable()
export class LookDriver extends EyeTrackingDriver {

  /**
   * Path of Look software.
   */
  private get lookPath(): string {
    return this.sensorDataService.toOsDir(this.configService.get<string>('DRIVER_LOOK_PATH', './'));
  }
  /**
   * Gets the path to the Look executable.
   */
  private get executablePath(): string {
    return this.sensorDataService.toOsDir(this.configService.get<string>('DRIVER_LOOK_SERVER_APP', join(this.lookPath, 'Look.exe')));
  }
  /**
   * Start parameters for Look Server process.
   */
  private get startParams(): string[] {
    return this.configService.get<string>('DRIVER_LOOK_INIT_PARAMS', '').split(' ');
  }

  /**
   * Time in ms between failed Look Server process start and retry.
   */
  private get restartTime(): number {
    return this.configService.get<number>('DRIVER_LOOK_RESTART_TIME', 5000);
  }

  /**
   * Signalling endpoint of Look process for establishing WebRTC connection to Look Server.
   */
  private get signallingEndpoint(): string {
    return this.configService.get<string>('DRIVER_LOOK_SIGNALLING_ENDPOINT', 'http://localhost:8080/offer');
  }

  sendCustomConfig = (data: string) => {

  };

  /**
   * Description of channels.
   */
  readonly channelDescriptions: ChannelDescriptionMap = {
    dataChannels: {
      /**
       * Config channel to send states and receive commands.
       */
      'config': ConfigChannelDescription(this),

      /**
       * Custom config channel to send mute commands.
       */
      'customConfig': {
        configuration: {
          maxPacketLifeTime: 5000,
          ordered: true
        },
        onData: async (data: string) => {
          switch (data) {
            case 'mute':
              try {
                await this.mute();
                this.sendCustomConfig('muted');
              } catch (error) {
                this.sendCustomConfig(`error:${error}`);
                this.loggerService.error(`Failed to mute look driver: ${error}`, this.constructor.name);
              }
              break;
            case 'unmute':
              try {
                await this.unmute();
                this.sendCustomConfig('unmuted');
              } catch (error) {
                this.sendCustomConfig(`error:${error}`);
                this.loggerService.error(`Failed to unmute look driver: ${error}`, this.constructor.name);
              }
              break;
          }
        },
        onOpen: () => {},
        onClose: () => {},
        sendCallbacks: [
          this.sendCustomConfig,
        ],
      },
    },
    mediaChannels: {
      /**
       * Media stream of field camera.
       */
      'field': {
        kind: 'video',
      }
    }
  };

  /**
   * Look Server process instance handler.
   */
  private lookProcess?: LookProcessHandler = undefined;

  /**
   * Target directory of recordings.
   */
   private targetDirectory?: string;

  /**
   * Handles new field video track.
   * @param track New field track from eye tracker.
   */
  private readonly onFieldTrack = async (track: MediaStreamTrack) => {
    this.loggerService.debug(`Field track received: ${track.id}`, this.constructor.name);
    const channel = this.channelDescriptions.mediaChannels['field'];
    if (channel.setInputTrack) {
      this.loggerService.debug(`Track of 'field' received: ${track.id} | ${channel.outputTrack?.id}. Applying to stream...`, this.constructor.name);
      channel.setInputTrack(track);
      this.loggerService.debug(`Track of 'field' stream applied: ${channel.outputTrack?.id} ${track.muted}`, this.constructor.name);
    } else {
      this.loggerService.error(`Failed to set new track: SetTrack of 'field' stream is not defined`, this.constructor.name);
    }
  };

  private readonly onStateChange = () => {
    this.setCalibratingState(this.connector.calibrationState);
    this.setCalibrationState(this.connector.calibrated);
  };

  /**
   * Constructs a new Look! eye tracking driver.
   * @param configService Configuration Service instance.
   * @param connector Look Connector Service instance.
   * @param driverInfo Sensor driver information.
   * @param loggerService Logger Service instance.
   * @param sensorDataService Sensor Data Service instance.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly connector: LookConnectorService,
    driverInfo: SensorDriverInfo,
    private readonly loggerService: LoggerService,
    private readonly sensorDataService: SensorDataService,
  ) {
    super('Look', {
      calibratable: true,
      connectable: true,
      recordable: true,
      streamable: true,
      requiresStreamingRestart: true,
    }, loggerService);
    this.configuration = driverInfo.config[this.type]?.[this.name] ?? {};
  }

  /**
   * Starts the look process.
   */
  private async startLookProcess(): Promise<void> {
    // Ensure that process is not running.
    if (this.lookProcess) {
      this.loggerService.debug(`Look process already started!`, this.constructor.name);
      return;
    }
    try {
      // Start the look process and wait for initialization response.
      await new Promise<void>(async (resolve, reject) => {
        // Start Look Server instance.
        let success = false;
        while (!success) {
          try {
            this.loggerService.debug(`Starting Look Server instance...`, this.constructor.name);
            // Create new process handler.
            this.lookProcess = new LookProcessHandler(this.executablePath, this.startParams, -20);
            // Subscribe process events.
            this.lookProcess.on('error', (error: any) => {
              const errorMsg = `${JSON.stringify(error)} | ${error.name}: ${error.message}`;
              this.loggerService.error(errorMsg, 'Look Server');
              reject(errorMsg);
            });
            this.lookProcess.on('exit', (code: number, signal: NodeJS.Signals) => {
              this.loggerService.debug(`Look server closed with code ${code} and signal ${signal}`, this.constructor.name);
              this.lookProcess = undefined;
            });
            this.lookProcess.on('message', (message: string) => {
              this.loggerService.log(`Message: ${message}`, 'Look Server');
            });
            this.lookProcess.on('stderr', data => {
              this.loggerService.error(`STDERR: ${data}`, 'Look Server');
              // if (data.toString().includes('[ WARN:0]')) {
              //   resolve();
              // }
            });
            this.lookProcess.on('stdout', (data: string) => {
              this.loggerService.debug(`STDOUT: ${data}`, 'Look Server');
              // if (data.toString().includes('Dieses Fenster schlie�en, um das Programm zu beenden.')) {
              //   resolve();
              // }
            });
            this.loggerService.debug(`Starting new Look Server instance: ${JSON.stringify(this.lookProcess)}`, this.constructor.name);
            setTimeout(() => {
              resolve();
            }, 2000);
            await this.lookProcess.start();
            this.loggerService.log('Look Server stopped', this.constructor.name);
            success = true;
          } catch (error) {
            success = false;
            this.loggerService.error(`Look Server crashed: ${error}`, this.constructor.name);
            this.loggerService.log(`Restarting Look Server in ${this.restartTime} ms ...`, this.constructor.name);
            // Wait restart time before restart.
            await sleep(this.restartTime);
            this.loggerService.debug('Restarting Look Server instance...', this.constructor.name);
            // Stop Look process if running.
            if (this.lookProcess) {
              await this.stopLookProcess();
            }
            // Since success is false, the look process will be recreated in next while loop iteration.
          }
        }
      });
    } catch (error) {
      throw `Failed to start Look: ${error}`;
    }
  }
  /**
   * Stops the look process.
   */
  private async stopLookProcess(): Promise<void> {
    if (!this.lookProcess) {
      // Look process already stopped.
      this.loggerService.debug(`Look Service already stopped!`, this.constructor.name);
    } else if (!this.lookProcess.active) {
      // Look process already stopped, but not removed.
      this.loggerService.debug(`Look process already stopped but not removed`, this.constructor.name);
      this.lookProcess = undefined;
    } else {
      // Prepare stop method.
      const stop = async () => {
        try {
          this.loggerService.debug(`Stopping Look Server...`, this.constructor.name);
          await Promise.all([
            this.lookProcess.termination(),
            this.lookProcess.stop(),
          ]);
          this.loggerService.debug(`Look Server stopped`, this.constructor.name);
          return true;
        } catch (error) {
          this.loggerService.error(`Failed to stop Look Server: ${error} Retrying in 100 ms...`, this.constructor.name);
          return false;
        }
      };
      // Retry stopping Look server every 100 ms until success.
      while (this.lookProcess && this.lookProcess.active && !(await stop())) {
        this.loggerService.debug('Trying to stop Look Server instance...', this.constructor.name);
        await sleep(100);
      }
    }
  }

  /**
   * Configures the sensor.
   */
  protected _configure(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Starts the Look Server process.
   */
  protected async _initialize(): Promise<void> {
    this.loggerService.debug('Initializing Look Driver...', this.constructor.name);
    // Register storage directory.
    this.targetDirectory = await this.sensorDataService.register(STORAGE_DIRECTORY);
    const destination = join(this.targetDirectory, 'recordings.sqlite3');
    const source = join(this.lookPath, 'recordings/recordings.sqlite3.template');
    try {
      await promisify(stat)(destination);
    } catch (error) {
      try {
        await promisify(copyFile)(source, destination);
      } catch (error) {
        throw `Failed to copy Look recordings database from ${source} to ${destination}: ${error}`;
      }
    }
    this.connector.addEventListener('track', this.onFieldTrack);
    this.connector.addEventListener('calibratingStateChange', this.onStateChange);
    this.connector.addEventListener('calibrationStateChange', this.onStateChange);
    this.loggerService.debug('Look Driver initialized', this.constructor.name);
  }
  /**
   * Terminates the Look Server process.
   */
  protected async _terminate(): Promise<void> {
    this.loggerService.debug('Terminating Look Driver...', this.constructor.name);
    this.connector.removeEventListener('track', this.onFieldTrack);
    this.connector.removeEventListener('calibratingStateChange', this.onStateChange);
    this.connector.removeEventListener('calibrationStateChange', this.onStateChange);
    this.loggerService.debug('Look Driver terminated', this.constructor.name);
  }

  async mute() {
    this.connector.disconnect();
  }
  async unmute() {
    await this.connector.connect(this.signallingEndpoint, true);
  }

  /**
   * Connects to the Look Server process.
   */
  protected async _connect(): Promise<void> {
    this.loggerService.debug('Starting Look Server process...', this.constructor.name);
    await this.startLookProcess();
    this.loggerService.debug('Connecting to Look Server process...', this.constructor.name);
    await this.connector.connect(this.signallingEndpoint, true);
    this.loggerService.debug('Connected to Look Server process!', this.constructor.name);
  }
  /**
   * Disconnects from the Look Server process.
   */
  protected async _disconnect(): Promise<void> {
    this.loggerService.debug('Disconnecting from Look Server process...', this.constructor.name);
    this.connector.disconnect();
    this.loggerService.debug('Stopping Look Server process!', this.constructor.name);
    await this.stopLookProcess();
    this.loggerService.debug('Look Server process stopped!', this.constructor.name);
  }

  /**
   * Starts calibration.
   */
  protected async _startCalibrating(): Promise<void> {
    this.loggerService.debug(`Sending start calibrating request to Look Server...`, this.constructor.name);
    await this.connector.startCalibrate();
    this.loggerService.debug(`Start calibrating request to Look Server sent. Look is now calibrating.`, this.constructor.name);
  }
  /**
   * Stops calibration.
   */
  protected async _stopCalibrating(): Promise<void> {
    this.loggerService.debug(`Sending stop calibrating request to Look Server...`, this.constructor.name);
    await this.connector.stopCalibrate();
    this.loggerService.debug(`Stop calibrating request to Look Server sent. Look stopped calibrating.`, this.constructor.name);
  }

  /**
   * Starts the recording.
   */
  protected async _startRecording(): Promise<void> {
    this.loggerService.debug(`Sending start recording request to Look Server...`, this.constructor.name);
    await this.connector.startRecording();
    this.loggerService.debug(`Start recording request to Look Server sent. Look is now recording.`, this.constructor.name);
  }
  /**
   * Stops the recording.
   */
  protected async _stopRecording(): Promise<void> {
    this.loggerService.debug(`Sending stop recording request to Look Server...`, this.constructor.name);
    await this.connector.stopRecording();
    this.loggerService.debug(`Stop recording request to Look Server sent. Look stopped recording.`, this.constructor.name);
  }

  /**
   * Starts the Look Server.
   */
  protected async _startStreaming(): Promise<void> {
    const event: EyeTrackingEvent = {
      data: this.channelDescriptions.mediaChannels['field'].outputTrack, // This must be set, so no nullish coalescing operator needed.
      t: 0,
      type: 'track',
    };
    this.emit('data', event);
  }
  /**
   * Stops the Look Server.
   */
  protected async _stopStreaming(): Promise<void> {
    // Nothing to do here.
  }
}
