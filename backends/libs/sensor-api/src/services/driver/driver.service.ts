import { LoggerService } from '@libs/logger';
import { SensorEventMap } from '@libs/sensor-api/types/sensor-event.type';
import { Inject, Injectable, Optional } from '@nestjs/common';

import { EcgDriver } from '../../types/ecg/ecg-driver';
import { EdaDriver } from '../../types/eda/eda-driver';
import { EyeTrackingDriver } from '../../types/eye-tracking/eye-tracking-driver';
import { MovementDriver } from '../../types/movement/movement-driver';
import { SensorDriver } from '../../types/sensor/sensor-driver';

/**
 * Service for driver management.
 */
@Injectable()
export class DriverService {

  /**
   * Maps types of drivers to its instances.
   */
  private readonly drivers: { [type: string]: SensorDriver[] } = {};

  /**
   * Gets types of all drivers.
   */
   get driverTypes(): string[] {
    return Object.getOwnPropertyNames(this.drivers);
  }

  constructor(
    private readonly loggerService: LoggerService,
    @Optional() @Inject('ecg') ecgDrivers: Array<EcgDriver>,
    @Optional() @Inject('eda') edaDrivers: Array<EdaDriver>,
    @Optional() @Inject('etk') etkDrivers: Array<EyeTrackingDriver>,
    @Optional() @Inject('mov') movDrivers: Array<MovementDriver>,
  ) {
    const unfilteredDrivers = [ ecgDrivers, edaDrivers, etkDrivers, movDrivers ];
    const filteredDrivers = unfilteredDrivers.filter(x => x !== undefined);
    const drivers = filteredDrivers.length > 0 ? filteredDrivers.reduce((p, c) => [...p, ...c]) : [];
    drivers.forEach(driver => {
      // Index the driver.
      if (!(driver.type in this.drivers)) {
        this.drivers[driver.type] = [];
      }
      this.drivers[driver.type].push(driver);
      drivers.forEach(d => {
        d.addListener('error', (message, error) => {
          this.loggerService.error(`${message}: ${error}`, d.constructor.name);
        });
      });
    });
  }

  /**
   * Adds a listener to all drivers of matching type.
   * @param event Name of event.
   * @param listener Listener callback.
   * @param type Type of driver. If not set, all drivers will be used.
   */
  addListener<K extends keyof SensorEventMap>(event: K, listener: (...args: SensorEventMap[K]) => void, type?: string): void {
    this.forEachDriver(d => d.addListener(event, listener), type);
  }

  /**
   * Removes a listener from all drivers of matching type.
   * @param event Name of event.
   * @param listener Listener callback.
   * @param type Type of driver. If not set, all drivers will be used.
   */
  removeListener<K extends keyof SensorEventMap>(event: K, listener: (...args: SensorEventMap[K]) => void, type?: string): void {
    this.forEachDriver(d => d.removeListener(event, listener), type);
  }

  /**
   * Gets all driver instances of a specific type.
   * @param type Optional type, if undefined or null, all drivers will be returned.
   * @returns Requested driver instances.
   */
  getDrivers(type?: string): SensorDriver[] {
    if (type) {
      return type in this.drivers ? this.drivers[type] : [];
    } else {
      const driverTypes = Object.getOwnPropertyNames(this.drivers);
      const drivers = driverTypes.map(driverType => this.drivers[driverType]);
      return drivers.length > 0 ? drivers.reduce((p, c) => [...p, ...c]) : [];
    }
  }

  /**
   * Performs an action to all drivers of matching type.
   * @param action Action to perform.
   * @param type Type of driver to perform action to. If undefined, action will be performed to all drivers.
   */
  private async forEachDriver(action: (driver: SensorDriver) => any | Promise<any>, type?: string): Promise<void> {
    const drivers = this.getDrivers(type);
    await Promise.all(
      drivers.map((d) => action(d))
    );
  }

  /**
   * Configures drivers.
   * @param type Optional type of sensors. If not set, all drivers will be configured.
   */
  async configureDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => await d.configure(), type);
  }

  /**
   * Initializes drivers.
   * @param type Optional type of sensors. If not set, all drivers will be initialized.
   */
  async initializeDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => await d.initialize(), type);
  }

  /**
   * Terminates drivers.
   * @param type Optional type of sensors. If not set, all drivers will be terminated.
   */
  async terminateDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => await d.terminate(), type);
  }

  /**
   * Resets drivers.
   * @param type Optional type of sensors. If not set, all drivers will be reset.
   */
  async resetDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => await d.reset(), type);
  }

  /**
   * Connects drivers.
   * @param type Optional type of sensors. If not set, all drivers will be connected.
   */
  async connectDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => await d.connect(), type);
  }
  /**
   * Disconnects drivers.
   * @param type Optional type of sensors. If not set, all drivers will be disconnected.
   */
  async disconnectDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => await d.disconnect(), type);
  }

  /**
   * Starts streaming of drivers.
   * @param type Optional type of sensors. If not set, all drivers will start streaming.
   */
  async startStreamingDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => {
      // Connect driver if connectable and not connected, then start streaming.
      if (!d.capabilities.connectable || d.connectionState === 'running' || d.connectionState === 'starting' || await d.connect()) {
        await d.startStreaming();
      }
    }, type);
  }
  /**
   * Stops streaming of drivers.
   * @param type Optional type of sensors. If not set, all drivers will stop streaming.
   */
  async stopStreamingDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => await d.stopStreaming(), type);
  }

  /**
   * Starts recording of drivers.
   * @param type Optional type of sensors. If not set, all drivers will start recording.
   */
  async startRecordingDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => {
      // Connect driver if connectable and not connected, then start recording.
      if (!d.capabilities.connectable || d.connectionState === 'running' || d.connectionState === 'starting' || await d.connect()) {
        await d.startRecording();
      }
    }, type);
  }
  /**
   * Stops recording of drivers.
   * @param type Optional type of sensors. If not set, all drivers will stop recording.
   */
  async stopRecordingDrivers(type?: string): Promise<void> {
    await this.forEachDriver(async d => await d.stopRecording(), type);
  }
}
