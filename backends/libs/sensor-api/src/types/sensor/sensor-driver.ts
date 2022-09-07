import { LoggerService } from '@libs/logger';
import { EventEmitter, SensorCapabilities, SensorConfigMessage, SensorConfigStateMessage, SensorPropertyState, SensorState } from '../../../../../../shared/dist';

import { ChannelDescriptionMap } from '../channel-description.interface';
import { SensorEventMap } from '../sensor-event.type';
import { SensorConfiguration } from './sensor-configuration.interface';

export abstract class SensorDriver {

  private _configurationState: SensorPropertyState = 'stopped';
  /**
   * Gets the driver's configuration state.
   */
  get configurationState(): SensorPropertyState {
    return this._configurationState;
  }
  /**
   * Sets the driver's configuration state.
   * @param value New configuration state.
   */
  protected setConfigurationState(value: SensorPropertyState): void {
    if (!this.capabilities.configurable) return;
    this._configurationState = value;
    this.emit('configurationStateChange', value);
  }

  private _connectionState: SensorPropertyState = 'stopped';
  /**
   * Gets the driver's connection state.
   */
  get connectionState(): SensorPropertyState {
    return this._connectionState;
  }
  /**
   * Sets the driver's connection state.
   * @param value New connection state.
   */
  protected setConnectionState(value: SensorPropertyState): void {
    if (!this.capabilities.connectable) return;
    this._connectionState = value;
    this.emit('connectionStateChange', value);
  }

  private _initializationState: SensorPropertyState = 'stopped';
  /**
   * Gets the driver's initialization state.
   */
  get initializationState(): SensorPropertyState {
    return this._initializationState;
  }
  /**
   * Sets the driver's initialization state.
   * @param value New initialization state.
   */
  protected setInitializationState(value: SensorPropertyState): void {
    this._initializationState = value;
    this.emit('initializationStateChange', value);
  }

  private _calibrationState: boolean = false;
  /**
   * Gets if the driver is calibrated.
   * @returns true = calibrated, false = not calibrated.
   */
  get calibrationState(): boolean {
    return this._calibrationState;
  }
  protected setCalibrationState(value: boolean): void {
    if (!this.capabilities.calibratable) return;
    this._calibrationState = value;
    this.emit('calibrationStateChange', value);
  }

  private _calibratingState: SensorPropertyState = 'stopped';
  /**
   * Gets the driver's calibrating state.
   */
  get calibratingState(): SensorPropertyState {
    return this._calibratingState;
  }
  protected setCalibratingState(value: SensorPropertyState): void {
    if (!this.capabilities.calibratable) return;
    this._calibratingState = value;
    this.emit('calibratingStateChange', value);
  }

  private _recordingState: SensorPropertyState = 'stopped';
  /**
   * Gets the driver's recording state.
   */
  get recordingState(): SensorPropertyState {
    return this._recordingState;
  }
  /**
   * Sets the driver's recording state.
   * @param value New recording state.
   */
  protected setRecordingState(value: SensorPropertyState): void {
    if (!this.capabilities.recordable) return;
    this._recordingState = value;
    this.emit('recordingStateChange', value);
  }

  private _streamingState: SensorPropertyState = 'stopped';
  /**
   * Gets the driver's streaming state.
   */
  get streamingState(): SensorPropertyState {
    return this._streamingState;
  }
  /**
   * Sets the driver's streaming state.
   * @param value New streaming state.
   */
  protected setStreamingState(value: SensorPropertyState): void {
    if (!this.capabilities.streamable) return;
    this._streamingState = value;
    this.emit('streamingStateChange', value);
  }

  /**
   * Description if required channels to Therapist UI.
   */
  readonly channelDescriptions: ChannelDescriptionMap;

  /**
   * Configuration to apply with next execution of configure().
   */
  configuration: SensorConfiguration;

  /**
   * Emitter for events.
   */
  private readonly emitter = new EventEmitter();

  /**
   * Gets the identity of the sensor driver.
   */
  get id(): string {
    return `${this.type}_${this.name}`;
  }

  /**
   * Gets the state of the sensor.
   */
  get state(): SensorState {
    return {
      capabilities: this.capabilities,
      calibrating: this.calibratingState,
      calibration: this.calibrationState,
      configuration: this.configurationState,
      connection: this.connectionState,
      initialization: this.initializationState,
      recording: this.recordingState,
      streaming: this.streamingState
    };
  }

  /**
   * Constructs a new sensor driver instance.
   * @param name Name of sensor driver.
   * @param capabilities Capabilities of the sensor driver.
   * @param logger Logger Service instance.
   * @param type Type of sensor driver.
   */
  constructor(
    readonly name: string,
    readonly capabilities: SensorCapabilities,
    readonly logger: LoggerService,
    readonly type: string,
  ) {}

  /**
   * Emits an event.
   * @param event Name of event.
   * @param args Optional event arguments.
   */
  protected async emit<K extends keyof SensorEventMap>(event: K, ...args: SensorEventMap[K]): Promise<void> {
    await this.emitter.emit(event, ...args);
  }
  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param listener Listener callback to add.
   */
  addListener<K extends keyof SensorEventMap>(event: K, listener: (...args: SensorEventMap[K]) => any): void {
    this.emitter.addListener(event, listener);
  }
  /**
   * Removes a event listener.
   * @param event Name of event.
   * @param listener Listener callback to remove.
   */
  removeListener<K extends keyof SensorEventMap>(event: K, listener: (...args: SensorEventMap[K]) => any): void {
    this.emitter.removeListener(event, listener);
  }

  /**
   * Implements configuration of the sensor driver.
   */
  protected abstract _configure(): Promise<void> | void;
  /**
   * Configures or calibrates the sensors.
   * @returns true = successful, false = failed.
   */
  async configure(): Promise<boolean> {
    if (!this.capabilities.configurable) return true;
    try {
      this.setConfigurationState('starting');
      await this._configure();
      this.setConfigurationState('stopped');
      return true;
    } catch (error) {
      this.setConfigurationState('failed');
      this.emit('error', `Failed to configure driver ${this.name} of type ${this.type} with configuration ${JSON.stringify(this.configuration)}`, error);
      return false;
    }
  }

  /**
   * Implements initialization of the sensor driver.
   */
  protected abstract _initialize(): Promise<void> | void;
  /**
   * Initializes the sensors.
   * @returns true = success, false = failed.
   */
  async initialize(): Promise<boolean> {
    try {
      this.setInitializationState('starting');
      await this._initialize();
      this.setInitializationState('running');
      return true;
    } catch (error) {
      this.setInitializationState('failed');
      this.emit('error', `Failed to initialize driver ${this.name} of type ${this.type}`, error);
      return false;
    }
  }
  /**
   * Implements termination of the sensor driver.
   */
  protected abstract _terminate(): Promise<void> | void;
  /**
   * Terminates the sensor driver.
   * @returns true = success, false = failed.
   */
  async terminate(): Promise<boolean> {
    try {
      this.setInitializationState('stopping');
      await this.stopStreaming();
      await this.stopRecording();
      await this.disconnect();
      await this._terminate();
      this.setInitializationState('stopped');
      return true;
    } catch (error) {
      this.setInitializationState('failed');
      this.emit('error', `Failed to terminate driver ${this.name} of type ${this.type}`, error);
      return false;
    }
  }
  /**
   * Resets the sensor driver by terminating it and initializing it again.
   * @returns true = success, false = failed.
   */
  async reset(): Promise<boolean> {
    let term = await this.terminate();
    return term && await this.initialize();
  }

  /**
   * Implementation of connecting.
   */
  protected abstract _connect(): Promise<void> | void;
  /**
   * Connects to the driver.
   * @returns true = success, false = failed.
   */
  async connect(): Promise<boolean> {
    this.logger.log(`Connecting driver ${this.name}`, this.constructor.name);
    if (!this.capabilities.connectable) return true;
    if (this.connectionState === 'running') return true;
    try {
      this.setConnectionState('starting');
      await this._connect();
      this.setConnectionState('running');
      this.logger.log(`Connected driver ${this.name}`, this.constructor.name);
      return true;
    } catch (error) {
      this.setConnectionState('failed');
      this.emit('error', `Failed to start streaming data of driver ${this.name} of type ${this.type}`, error);
      this.logger.error(`Failed to connect driver ${this.name}`, this.constructor.name);
      return false;
    }
  }
  /**
   * Implementation of disconnecting.
   */
  protected abstract _disconnect(): Promise<void> | void;
  /**
   * Stops streaming sensor data.
   * @returns true = success, false = failed.
   */
  async disconnect(): Promise<boolean> {
    this.logger.log(`Disconnecting driver ${this.name}`, this.constructor.name);
    if (!this.capabilities.connectable) return true;
    if (this.connectionState === 'stopped') return true;
    try {
      this.setConnectionState('stopping')
      try {
        if (this.capabilities.calibratable && this.calibratingState !== 'stopped' && this.calibratingState !== 'failed') {
          await this.stopCalibrating();
        }
        if (this.capabilities.recordable && this.recordingState !== 'stopped' && this.recordingState !== 'failed') {
          await this.stopRecording();
        }
      } catch (error) { }
      await this._disconnect();
      this.setConnectionState('stopped');
      this.logger.log(`Disconnected driver ${this.name}`, this.constructor.name);
      return true;
    } catch (error) {
      this.setConnectionState('failed');
      this.emit('error', `Failed to stop streaming`, error);
      this.logger.error(`Failed to disconnect driver ${this.name}`, this.constructor.name);
      return false;
    }
  }

  /**
   * Implementation of starting calibration.
   */
  protected abstract _startCalibrating(): Promise<void> | void;
  /**
   * Starts calibrating sensor.
   * @returns true = success, false = failed.
   */
  async startCalibrating(): Promise<boolean> {
    this.logger.log(`Starting calibration of driver ${this.name}`, this.constructor.name);
    if (!this.capabilities.calibratable) return true;
    if (this.calibratingState === 'running') return true;
    try {
      this.setCalibratingState('starting');
      await this._startCalibrating();
      if (this.calibratingState === 'starting') {
        this.setCalibratingState('running');
      }
      this.logger.log(`Started calibration of driver ${this.name}`, this.constructor.name);
      return true;
    } catch (error) {
      this.setCalibratingState('failed');
      this.emit('error', `Failed to start calibration of driver ${this.name} of type ${this.type}`, error);
      this.logger.error(`Failed to start calibration of driver ${this.name}`, this.constructor.name);
      return false;
    }
  }
  /**
   * Implementation of stopping calibration.
   */
   protected abstract _stopCalibrating(): Promise<void> | void;
   /**
    * Stops calibrating sensor.
    * @returns true = success, false = failed.
    */
   async stopCalibrating(): Promise<boolean> {
    this.logger.log(`Stopping calibration of driver ${this.name}`, this.constructor.name);
     if (!this.capabilities.calibratable) return true;
     if (this.calibratingState === 'stopped') return true;
     try {
       this.setCalibratingState('stopping')
       await this._stopCalibrating();
       if (this.calibratingState === 'stopping') {
        this.setCalibratingState('stopped');
       }
       this.logger.log(`Stopped calibration of driver ${this.name}`, this.constructor.name);
       return true;
     } catch (error) {
       this.setCalibratingState('failed');
       this.emit('error', `Failed to stop calibration of driver ${this.name} of type ${this.type}`, error);
       this.logger.error(`Failed to stop calibration of driver ${this.name}`, this.constructor.name);
       return false;
     }
   }
 
  /**
   * Implementation of starting recording.
   */
  protected abstract _startRecording(): Promise<void> | void;
  /**
   * Starts recording sensor data.
   * @returns true = success, false = failed.
   */
  async startRecording(): Promise<boolean> {
    this.logger.log(`Starting recording of driver ${this.name}`, this.constructor.name);
    if (!this.capabilities.recordable) return true;
    if (this.recordingState === 'running') return true;
    try {
      this.setRecordingState('starting');
      await this._startRecording();
      this.setRecordingState('running');
      this.logger.log(`Started recording of driver ${this.name}`, this.constructor.name);
      return true;
    } catch (error) {
      this.setRecordingState('failed');
      this.emit('error', `Failed to start recording data of driver ${this.name} of type ${this.type}`, error);
      this.logger.error(`Failed to start recording of driver ${this.name}`, this.constructor.name);
      return false;
    }
  }
  /**
   * Implementation of stopping recording.
   */
  protected abstract _stopRecording(): Promise<void> | void;
  /**
   * Stops recording sensor data.
   * @returns true = success, false = failed.
   */
  async stopRecording(): Promise<boolean> {
    this.logger.log(`Stopping recording of driver ${this.name}`, this.constructor.name);
    if (!this.capabilities.recordable) return true;
    if (this.recordingState === 'stopped') return true;
    try {
      this.setRecordingState('stopping')
      await this._stopRecording();
      this.setRecordingState('stopped');
      this.logger.log(`Stopped recording of driver ${this.name}`, this.constructor.name);
      return true;
    } catch (error) {
      this.setRecordingState('failed');
      this.emit('error', `Failed to stop recording data of driver ${this.name} of type ${this.type}`, error);
      this.logger.error(`Failed to stop recording of driver ${this.name}`, this.constructor.name);
      return false;
    }
  }

  /**
   * Implementation of starting streaming.
   */
  protected abstract _startStreaming(): Promise<void> | void;
  /**
   * Starts streaming sensor data.
   * @returns true = success, false = failed.
   */
  async startStreaming(): Promise<boolean> {
    this.logger.log(`Starting streaming of driver ${this.name}`, this.constructor.name);
    if (!this.capabilities.streamable) return true;
    if (!this.capabilities.requiresStreamingRestart && this.streamingState === 'running') return true;
    try {
      this.setStreamingState('starting');
      await this._startStreaming();
      this.setStreamingState('running');
      this.logger.log(`Started streaming of driver ${this.name}`, this.constructor.name);
      return true;
    } catch (error) {
      this.setStreamingState('failed');
      this.emit('error', `Failed to start streaming data of driver ${this.name} of type ${this.type}`, error);
      this.logger.error(`Failed to start streaming of driver ${this.name}`, this.constructor.name);
      return false;
    }
  }
  /**
   * Implementation of stopping streaming.
   */
  protected abstract _stopStreaming(): Promise<void> | void;
  /**
   * Stops streaming sensor data.
   * @returns true = success, false = failed.
   */
  async stopStreaming(): Promise<boolean> {
    this.logger.log(`Stopping streaming of driver ${this.name}`, this.constructor.name);
    if (!this.capabilities.streamable) return true;
    if (this.streamingState === 'stopped') return true;
    try {
      this.setStreamingState('stopping')
      await this._stopStreaming();
      this.setStreamingState('stopped');
      this.logger.log(`Stopped streaming of driver ${this.name}`, this.constructor.name);
      return true;
    } catch (error) {
      this.setStreamingState('failed');
      this.emit('error', `Failed to stop streaming`, error);
      this.logger.error(`Failed to stop streaming of driver ${this.name}`, this.constructor.name);
      return false;
    }
  }

  /**
   * Sends data to a channel of a specific label.
   * @param label Label of data channel.
   * @param data Data to send.
   */
  send(label: string, data: string): void {
    if (!this.channelDescriptions.dataChannels) return;
    if (!(label in this.channelDescriptions.dataChannels)) return;
    const descriptions = this.channelDescriptions.dataChannels[label];
    descriptions.sendCallbacks.forEach(cb => {
      cb(data);
    });
  }
  /**
   * Sends a message to the config channels.
   * @param message Message to send.
   */
  sendConfigMessage(message: SensorConfigMessage): void {
    const data = JSON.stringify(message);
    this.send('config', data);
  }
  /**
   * Sends the sensor's state to the config channels.
   */
  sendState(): void {
    const message: SensorConfigStateMessage = {
      state: this.state,
      type: 'state'
    };
    this.sendConfigMessage(message);
  }
}

export class SensorDrivers<T extends SensorDriver> extends Array<T>{}
