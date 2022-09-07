import { LoggerService } from '@libs/logger';
import { RtcSenderService } from '@libs/rtc-sender';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelType, SensorData, TxChannel } from '../../../../../../shared/dist';

import { SensorType } from '../../types/sensor-type.enum';
import { DriverService } from '../driver/driver.service';

const DEFAULT_TARGET_DELAY = 1000;

/**
 * Connects the RTC Channels with the sensors.
 */
@Injectable()
export class AggregationService {
  /**
   * Stores the number of open channels.
   */
  private readonly openChannels: { [type: string]: number } = {
    ecg: 0,
    eda: 0,
    etk: 0,
    mon: 0,
    mov: 0,
  };

  /**
   * Synchronizes data and sends it to the receiver.
   * @param src Type of sensor the data came from.
   * @param dst Channel to send data with.
   * @param data Data to send.
   */
  private readonly syncAndSendData = (src: SensorType, dst: TxChannel, data: SensorData): void => {
    const sensorDate = data.t;
    if (!sensorDate && sensorDate !== 0) {
      this.loggerService.error(`Date of sensor of type ${src.toString()} data is invalid: ${JSON.stringify(data)}`, this.constructor.name);
      return;
    }
    if (sensorDate === 0) {
      try {
        dst.dataListener(data);
      } catch (error) {
        this.loggerService.error(`Failed to emit data listener: ${error}`, this.constructor.name);
      }
      return;
    }
    const nowDate = Date.now();
    const diff = nowDate - sensorDate;
    const delay = this.targetDelay - diff;

    if (this.maxDelay < (sensorDate - nowDate)) {
      this.loggerService.error(`Data of channel with type ${src.toString()} is too far in the future! date: ${new Date(sensorDate)}(${data.t})`);
      return;
    }

    // If delay is yet too large, drop data.
    if (delay > 100) {
      this.loggerService.warn(`Data of channel with type ${src.toString()} is yet delayed by ${delay} ms and is going to be dropped`, this.constructor.name);
      return;
    }

    // sensorDate   nowDate                    maxDelay
    //    |            |                          |
    //    |----diff----|                          |
    //    |---------------delay---------------|   |
    // ---+------------+----------------------+---+------> t

    setTimeout(() => {
      if (dst.state !== 'open') {
        this.loggerService.debug(`Channel of type ${dst.type.toString()} is not open, so delayed data is going to be dropped`, this.constructor.name);
        return;
      }
      try {
        dst.dataListener(data);
      } catch (error) {
        this.loggerService.error(`Failed to emit data listener: ${error}`, this.constructor.name);
      }
    }, delay);
  };

  /**
   * Time in ms that the streaming of data should be delayed.
   */
  private get targetDelay() {
    return this.configService.get<number>('TARGET_DELAY', DEFAULT_TARGET_DELAY);
  }

  /**
   * Maximum time in ms the streaming of data should be delayed.
   */
  private readonly maxDelay = 10000;

  /**
   * Constructs a new Aggregation service.
   * @param driverService Driver service instance.
   * @param loggerService Logger service instance.
   * @param rtcService RTC Sender service instance.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly driverService: DriverService,
    private readonly loggerService: LoggerService,
    private readonly rtcService: RtcSenderService,
  ) {
    this.rtcService.addListener('channel', channel => {
      this.onChannel(channel);
    });
  }

  /**
   * Gets a driver type by a channel type.
   * @param channelType Type of channel.
   * @returns Driver type or undefined, if channel does not correspond to a driver.
   */
  channelToDriver(channelType: ChannelType): SensorType | undefined {
    switch (channelType) {
      case ChannelType.ecg:
        return SensorType.ecg;
      case ChannelType.eda:
        return SensorType.eda;
      case ChannelType.eyetracking:
        return SensorType.etk;
      case ChannelType.movement:
        return SensorType.mov;
      default:
        return undefined;
    }
  }

  /**
   * Handles starting and stopping of sensors when a channel is opened and handles redirecting of sensor data to the channels.
   * @param channel Opened channel.
   */
  private onChannel(channel: TxChannel): void {
    // Get the channel and matching driver type.
    const channelType = channel.type.toString();
    const driverType = this.channelToDriver(channel.type);
    this.loggerService.verbose(
      `Channel opened with type ${channelType} and driver type ${driverType}`,
      this.constructor.name,
    );
    // Ensure that opened channel corresponds to a sensor.
    if (!driverType) {
      return;
    }
    // Create a method that connects the context from here to call the syncAndSendData method.
    const onData = (data: any): void => {
      this.syncAndSendData(driverType, channel, data);
    };
    // Subscribe forwarding of data from sensor to the channel.
    this.driverService.addListener('data', onData, driverType);
    // Start matching sensors, if not yet started.
    this.driverService.startStreamingDrivers(driverType);
    // Increase number of open channels.
    this.openChannels[channelType]++;
    // Subscribe to channel close event.
    channel.addListener('closed', () => {
      // Decrease number of open channels.
      this.openChannels[channelType]--;
      // Ensure that closed channel corresponds to a sensor.
      if (driverType) {
        // Unsubscribe forwarding of data from sensor to the channel.
        this.driverService.removeListener(
          'data',
          onData,
          driverType,
        );
        // Stop matching sensors, if no more channel is active.
        if (this.openChannels[channelType] <= 0) {
          this.driverService.stopStreamingDrivers(driverType);
        }
      }
    });
  }
}
