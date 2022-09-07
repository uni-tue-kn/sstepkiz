import { LoggerService } from '@libs/logger';
import { ChannelDescriptionMap, ConfigChannelDescription, CsvLogger, CsvLoggerService, SensorDataService, SensorDriverInfo } from '@libs/sensor-api';
import { MovementDriver } from '@libs/sensor-api';
import { MovementData, Vector3D } from '@sstepkiz';
import { Injectable } from '@nestjs/common';
import { join } from 'path';

/**
 * Frequency of logging received samples.
 */
const DEBUG_SAMPLES_FREQUENCY = 100; // Logs every 100th sample.

/**
 * Target directory of recorded Movesense Mov data.
 */
const STORAGE_DIRECTORY = 'movesense_mov';

/**
 * Movesense Movement Driver.
 */
@Injectable()
export class MovesenseMovDriver extends MovementDriver {

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
       * Data channel to receive data from sensor.
       */
      'movData': {
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
          try {
            if (this.sampleCount % DEBUG_SAMPLES_FREQUENCY === 0) {
              this.loggerService.debug(`Received Mov data sample #${this.sampleCount} from Aggregator UI: "${data}"`, this.constructor.name);
            }
            // Parse received data.
            let input=data.split("|");
            const accData = JSON.parse(input[0]);
            const gyrData = JSON.parse(input[1]);
            const magData = JSON.parse(input[2]);
            const deviceId = input[3];
            const samples: MovementData[] = [];
            for (let i = 0; i < accData.length && i < gyrData.length && i < magData.length; i++) { //go through all samples
              const accVec: Vector3D = {
                x: accData[i].x_value,
                y: accData[i].y_value,
                z: accData[i].z_value
              };
              const gyrVec: Vector3D = {
                x: gyrData[i].x_value,
                y: gyrData[i].y_value,
                z: gyrData[i].z_value
              };
              const magVec: Vector3D = {
                x: magData[i].x_value,
                y: magData[i].y_value,
                z: magData[i].z_value
              };
              const result : MovementData = {
                t: accData[i].timestamp,
                a: accVec,
                g: gyrVec,
                m: magVec,
                // p: undefined,
                // tp: undefined,
                id: deviceId, //what is a movement sensor id supposed to be
              };
              samples.push(result);
            }
            if (this.sampleCount % DEBUG_SAMPLES_FREQUENCY === 0) {
              this.loggerService.debug(`Parsed Mov data sample #${this.sampleCount} from Aggregator UI: "${JSON.stringify(samples)}"`, this.constructor.name);
            }
            this.sampleCount+=samples.length;
            samples.forEach((s)=> {
              this.emit('data', s); //do not emit all at once to allow logging
            });
          } catch (error) {
            this.emit('error', `Failed to handle received Mov data`, error);
          }
        },
        /**
         * Handles opened channel.
         */
        onOpen: () => {
          this.channelCount++;
          this.loggerService.debug(`New Movesense Movement data channel opened. Open channel count: ${this.channelCount}`, this.constructor.name);
          this.setConnectionState('running');
        },
        /**
         * Handles closed channel.
         */
        onClose: () => {
          this.channelCount--;
          this.loggerService.debug(`Movesense Movement data channel closed. Open channel count: ${this.channelCount}`, this.constructor.name);
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
   * Constructs a new Movesense Mov driver.
   * @param csvLoggerService CSV Logger Service instance.
   * @param loggerService Logger Service instance.
   * @param sensorDataService Sensor Data Service instance.
   * @param driverInfo Information about sensor driver.
   * @param logger Logger Service instance.
   */
  constructor(
    private readonly csvLoggerService: CsvLoggerService,
    private readonly loggerService: LoggerService,
    private readonly sensorDataService: SensorDataService,
    driverInfo: SensorDriverInfo,
  ) {
    super('MovesenseMov', {
      connectable: true,
      recordable: true,
      streamable: true
    }, loggerService);
    // Apply configuration.
    this.configuration = driverInfo.config[this.type]?.[this.name] ?? {};
  }

  /**
   * Configures the Movesense Mov driver.
   */
  protected _configure(): void | Promise<void> {
    // No configuration required -> Nothing to do here!
  }

  /**
   * Initializes the Movesense Mov driver.
   */
  protected async _initialize(): Promise<void> {
    // Reset number of samples.
    this.sampleCount = 0;
    // Register storage directory.
    this.targetDirectory = await this.sensorDataService.register(STORAGE_DIRECTORY);
  }
  /**
   * Terminates the Movesense Mov driver.
   */
  protected _terminate(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Connects to Movesense Mov sensor.
   */
  protected _connect(): void | Promise<void> {
    // Data channel to Aggregator UI already opened, Aggregator UI will connect to bluetooth ECG sensor.
    // -> Nothing to do here!
  }
  /**
   * Disconnects from Movesense Mov sensor.
   */
  protected _disconnect(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Starts calibration of Movesense Mov.
   */
  protected _startCalibrating(): void | Promise<void> {
    // Nothing to do here!
  }
  /**
   * Stops calibration of Movesense Mov.
   */
  protected _stopCalibrating(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Starts streaming of Movesense Mov data.
   */
  protected _startStreaming(): void | Promise<void> {
    // Data are emitted when received -> Nothing to do here!
  }
  /**
   * Stops streaming of Movesense Mov data.
   */
  protected _stopStreaming(): void | Promise<void> {
    // Nothing to do here!
  }

  /**
   * Starts recording.
   */
  protected async _startRecording(): Promise<void> {
    this.loggerService.debug(`Starting recording of Movesense Mov`, this.constructor.name);
    // Ensure that recording is not yet running.
    if (this.recorder) {
      this.loggerService.warn(`Recording of Movesense Mov already stated!`, this.constructor.name);
      return;
    }
    if (!this.targetDirectory) {
      throw 'Recording target directory is not registered! Run initialization first!';
    }
    // Generate path of recording file.
    const date = (new Date()).toISOString();
    const path = join(this.targetDirectory, `movesense_mov_${date.replace(/\D/g, '')}.csv`);
    this.loggerService.debug(`Movesense Mov data will be recorded to ${path}`, this.constructor.name);
    // Create a new recorder instance.
    this.recorder = this.csvLoggerService.create(path, ['t', 'acc_x', 'acc_y', 'acc_z', 'mag_x', 'mag_y', 'mag_z', 'gyro_x', 'gyro_y', 'gyro_z']);
    this.loggerService.debug(`Movesense Mov recorder created`, this.constructor.name);
    // Prepare callbacks.
    const onEnded = () => {
      this.loggerService.debug(`Recording Movesense Mov ended`, this.constructor.name);
      // Unsubscribe from ended recorder.
      this.recorder.removeEventListener('ended', onEnded);
      // Remove recorder instance.
      this.recorder = undefined;
      // Unsubscribe from received data.
      this.removeListener('data', onData);
      // Update recording state.
      this.setRecordingState('stopped');
    };
    const onData = (data: MovementData) => {
      try {
        if (this.recorder) {
          // Write data to file using recorder.
          this.recorder.write([ data.t, data.a.x, data.a.y, data.a.z, data.m.x, data.m.y, data.m.z, data.g.x, data.g.y, data.g.z ]);
        }
      } catch (error) {
        this.emit('error', `Failed to write mov data to file`, error);
      }
    };
    // Subscribe to ended recorder and to received data.
    this.recorder.addEventListener('ended', onEnded);
    this.addListener('data', onData);
    this.loggerService.debug(`Recording of Movesense Mov started!`, this.constructor.name);
  }
  /**
   * Stops recording.
   */
  protected async _stopRecording(): Promise<void> {
    this.loggerService.debug(`Stopping recording of Movesense Mov...`, this.constructor.name);
    // Ensure that recording is not already stopped.
    if (!this.recorder) {
      this.loggerService.warn(`Recording of Movesense Mov already stopped!`, this.constructor.name);
    }
    // End recording.
    await this.recorder.end();
    this.loggerService.debug(`Recording of Movesense Mov stopped!`, this.constructor.name);
  }
}
