import { LoggerService } from '@libs/logger';
import { ChannelDescriptionMap, ConfigChannelDescription, CsvLogger, CsvLoggerService, EcgDriver, SensorDataService, SensorDriverInfo } from '@libs/sensor-api';
import { Injectable } from '@nestjs/common';
import { EcgData, EcgVoltageData } from '@sstepkiz';
import { join } from 'path';

/**
 * Frequency of logging received samples.
 */
const DEBUG_SAMPLES_FREQUENCY = 100; // Logs every 100th sample.

/**
 * Target directory of recorded Movesense ECG data.
 */
const STORAGE_DIRECTORY = 'movesense_ecg';

/**
 * Movesense ECG Driver.
 */
@Injectable()
export class MovesenseEcgDriver extends EcgDriver {

  /**
   * Number of open channels to Aggregator UI to receive data from.
   */
  private channelCount: number = 0;

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
       * Data channel to receive voltage from sensor
       */
      'voltage': {
        /**
         * SCTP parameters.
         */
        configuration: {
          maxPacketLifeTime: 5000,
          ordered: false
        },
        /**
         * Handles received data.
         * @param data Received data.
         */
        onData: (data: string) => {
          // Parse received data.
          const voltageData: EcgVoltageData = JSON.parse(data);
          try {
            if (this.recorder) {
              // Write data to file using recorder.
              this.recorder.write([ voltageData.timestamp, voltageData.voltage ]);
            }
          } catch (error) {
            this.emit('error', `Failed to write voltage to file`, error);
          }
        },
        /**
         * Handles opened channel.
         */
        onOpen: () => {
          this.channelCount++;
          this.loggerService.debug(`New ECG voltage channel opened. Open channel count: ${this.channelCount}`, this.constructor.name);
          this.setConnectionState('running'); // can we set this twice?
        },
        /**
         * Handles closed channel.
         */
        onClose: () => {
          this.channelCount--;
          this.loggerService.debug(`ECG voltage channel closed. Open channel count: ${this.channelCount}`, this.constructor.name);
          if (this.channelCount <= 0) {
            this.setConnectionState('stopped');
          }
        }
      },
      /**
       * Data channel to receive data from sensor.
       */
      'data': {
        /**
         * SCTP parameters.
         */
        configuration: {
          maxPacketLifeTime: 5000,
          ordered: false
        },
        /**
         * Handles received data.
         * @param data Received data.
         */
        onData: (data: string) => {
          if (this.sampleCount % DEBUG_SAMPLES_FREQUENCY === 0) {
            this.loggerService.debug(`Received ECG data sample #${this.sampleCount} from Aggregator UI: "${data}"`, this.constructor.name);
          }
          this.sampleCount++;
          try {
            // Parse received data.
            const ecgData: EcgData = JSON.parse(data);
            // Emit received and parsed data.
            this.emit('data', ecgData);
          } catch (error) {
            this.emit('error', `Failed to handle received ECG data`, error);
          }
        },
        /**
         * Handles opened channel.
         */
        onOpen: () => {
          this.channelCount++;
          this.loggerService.debug(`New ECG data channel opened. Open channel count: ${this.channelCount}`, this.constructor.name);
          this.setConnectionState('running');
        },
        /**
         * Handles closed channel.
         */
        onClose: () => {
          this.channelCount--;
          this.loggerService.debug(`ECG data channel closed. Open channel count: ${this.channelCount}`, this.constructor.name);
          if (this.channelCount <= 0) {
            this.setConnectionState('stopped');
          }
        }
      }
    }
  };

  /**
   * CSV logger which writes data to a CSV file.
   */
  private recorder?: CsvLogger;

  /**
   * Zero-starting number of received samples.
   */
  private sampleCount: number = 0;

  /**
   * Target directory of recordings.
   */
  private targetDirectory?: string;

  /**
   * Constructs a new Movesense ECG driver.
   * @param csvLoggerService CSV Logger Service instance.
   * @param loggerService Logger Service instance.
   * @param sensorDataService Sensor Data Service instance.
   * @param driverInfo Information about sensor driver.
   */
  constructor(
    private readonly csvLoggerService: CsvLoggerService,
    private readonly loggerService: LoggerService,
    private readonly sensorDataService: SensorDataService,
    driverInfo: SensorDriverInfo
  ) {
    super('MovesenseEcg', {
      connectable: true,
      recordable: true,
      streamable: true
    }, loggerService);
    // Apply configuration.
    this.configuration = driverInfo.config[this.type]?.[this.name] ?? {};
  }

  /**
   * Configures the Movesense ECG driver.
   */
  protected _configure(): void | Promise<void> {
    // No configuration required -> Nothing to do here!
  }

  /**
   * Initializes the Movesense ECG driver.
   */
  protected async _initialize(): Promise<void> {
    // Reset number of samples.
    this.sampleCount = 0;
    // Register storage directory.
    this.targetDirectory = await this.sensorDataService.register(STORAGE_DIRECTORY);
  }
  /**
   * Terminates the Movesense ECG driver.
   */
  protected _terminate(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Connects to Movesense ECG sensor.
   */
  protected _connect(): void | Promise<void> {
    // Data channel to Aggregator UI already opened, Aggregator UI will connect to bluetooth ECG sensor.
    // -> Nothing to do here!
  }
  /**
   * Disconnects from Movesense ECG sensor.
   */
  protected _disconnect(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Starts calibration of Movesense ECG.
   */
  protected _startCalibrating(): void | Promise<void> {
    // Nothing to do here!
  }
  /**
   * Stops calibration of Movesense ECG.
   */
  protected _stopCalibrating(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Starts streaming of Movesense ECG data.
   */
  protected _startStreaming(): void | Promise<void> {
    // Data are emitted when received -> Nothing to do here!
  }
  /**
   * Stops streaming of Movesense ECG data.
   */
  protected _stopStreaming(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Starts recording.
   */
  protected async _startRecording(): Promise<void> {
    this.loggerService.debug(`Starting recording of Movesense ECG`, this.constructor.name);
    // Ensure that recording is not yet running.
    if (this.recorder) {
      this.loggerService.warn(`Recording of Movesense ECG already stated!`, this.constructor.name);
      return;
    }
    if (!this.targetDirectory) {
      throw 'Recording target directory is not registered! Run initialization first!';
    }
    // Generate path of recording file.
    const date = (new Date()).toISOString();
    const path = join(this.targetDirectory, `movesense_ecg_${date.replace(/\D/g, '')}.csv`);
    this.loggerService.debug(`Movesense ECG data will be recorded to ${path}`, this.constructor.name);
    // Create a new recorder instance.
    if (!this.recorder) {
      this.recorder = this.csvLoggerService.create(path, ['t', 'voltage']);
      this.loggerService.debug(`Movesense ECG recorder created`, this.constructor.name);
      // Prepare callbacks.
      const onEnded = () => {
        this.loggerService.debug(`Recording Movesense ECG ended`, this.constructor.name);
        // Unsubscribe from ended recorder.
        this.recorder.removeEventListener('ended', onEnded);
        // Remove recorder instance.
        this.recorder = undefined;
        // Update recording state.
        this.setRecordingState('stopped');
      };
      // Subscribe to ended recorder and to received data.
      this.recorder.addEventListener('ended', onEnded);
    }
    this.loggerService.debug(`Recording of Movesense ECG started!`, this.constructor.name);
  }
  /**
   * Stops recording.
   */
  protected async _stopRecording(): Promise<void> {
    this.loggerService.debug(`Stopping recording of Movesense ECG...`, this.constructor.name);
    // Ensure that recording is not already stopped.
    if (!this.recorder) {
      this.loggerService.warn(`Recording of Movesense ECG already stopped!`, this.constructor.name);
    } else {
      // End recording.
      await this.recorder.end();
      this.recorder = undefined;
    }
    this.loggerService.debug(`Recording of Movesense ECG stopped!`, this.constructor.name);
  }
}
