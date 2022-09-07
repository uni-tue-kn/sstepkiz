import { Type } from '@angular/core';
import { SensorCapabilities, SensorCommand, SensorConfigCommandMessage, SensorConfigMessage, SensorPropertyState, SensorState } from '@sstepkiz';

import { SensorPeerInterface } from './sensor-peer.interface';
import { eventToPromise } from './sensor-to-promise.function';

export class Sensor {

  private configChannel: RTCDataChannel;

  batteryState?: number = undefined;

  /**
   * Custom component or undefined if not specified.
   */
  readonly customComponent?: Type<any>;

  get isConnected(): boolean {
    return !!this.configChannel;
  }

  private _capabilities?: SensorCapabilities = undefined;
  get capabilities(): SensorCapabilities | undefined {
    return this._capabilities;
  }

  private _calibratingState: SensorPropertyState = 'stopped';
  get calibratingState(): SensorPropertyState {
    return this._calibratingState;
  }

  private _calibrationState: boolean = false;
  get calibrationState(): boolean {
    return this._calibrationState;
  }

  private _configurationState: SensorPropertyState = 'stopped';
  get configurationState(): SensorPropertyState {
    return this._configurationState;
  }

  private _connectionState: SensorPropertyState = 'stopped';
  get connectionState(): SensorPropertyState {
    return this._connectionState;
  }

  private _initializationState: SensorPropertyState = 'stopped';
  get initializationState(): SensorPropertyState {
    return this._initializationState;
  }

  private _recordingState: SensorPropertyState = 'stopped';
  get recordingState(): SensorPropertyState {
    return this._recordingState;
  }

  private _streamingState: SensorPropertyState = 'stopped';
  get streamingState(): SensorPropertyState {
    return this._streamingState;
  }

  constructor(
    readonly type: string,
    readonly driver: string,
    protected readonly id: string,
    protected readonly peerInterface: SensorPeerInterface
  ) {
    this.peerInterface.getChannel('config').then((channel) => {
      this.configChannel = channel;
      const onMessage = (ev: MessageEvent<string>) => {
        const data: SensorConfigMessage = JSON.parse(ev.data);
        switch (data.type) {
          case 'cmd':
            // This message is for server.
            break;
          case 'state':
            this.applyState(data.state);
            break;
        }
      };
      this.configChannel.addEventListener('message', onMessage);
      eventToPromise<Event>(channel, 'close').then(() => {
        this.configChannel = undefined;
      });
    });
  }

  protected sendCommand(command: SensorCommand): void {
    const message: SensorConfigCommandMessage = {
      command,
      type: 'cmd'
    };
    const data = JSON.stringify(message);
    this.configChannel.send(data);
  }

  private applyState(state: SensorState) {
    this._capabilities = state.capabilities ?? {};
    this._calibratingState = state.calibrating ?? 'stopped';
    this._calibrationState = state.calibration ?? false;
    this._configurationState = state.configuration ?? 'stopped';
    this._connectionState = state.connection ?? 'stopped';
    this._initializationState = state.initialization ?? 'stopped';
    this._recordingState = state.recording ?? 'stopped';
    this._streamingState = state.streaming ?? 'stopped';
  }

  protected async _configure(): Promise<void> {
    this.sendCommand('configure');
    await eventToPromise<MessageEvent<SensorConfigMessage>>(this.configChannel, 'message',
      (ev) => ev?.data?.type === 'state' && ev?.data?.state?.configuration === 'stopped'
    );
  }
  async configure(): Promise<void> {
    if (this.capabilities.configurable) {
      await this._configure();
    }
  }

  protected async _connect(): Promise<void> {
    this.sendCommand('connect');
    await eventToPromise<MessageEvent<SensorConfigMessage>>(this.configChannel, 'message',
      (ev) => ev?.data?.type === 'state' && ev?.data?.state?.connection === 'running'
    );
  }
  async connect(): Promise<void> {
    if (this.capabilities.connectable) {
      await this._connect();
    }
  }

  protected async _disconnect(): Promise<void> {
    this.sendCommand('disconnect');
    await eventToPromise<MessageEvent<SensorConfigMessage>>(this.configChannel, 'message',
      (ev) => ev?.data?.type === 'state' && ev?.data?.state?.connection === 'stopped'
    );
  }
  async disconnect(): Promise<void> {
    if (this.capabilities.connectable) {
      await this._disconnect();
    }
  }

  protected async _initialize(): Promise<void> {

  }
  async initialize(): Promise<void> {
    await this._initialize();
  }
  protected async _terminate(): Promise<void> {

  }
  async terminate(): Promise<void> {
    await this._terminate();
  }

  protected async _reset(): Promise<void> {
    await this.terminate();
    this.sendCommand('reset');
    await eventToPromise<MessageEvent<SensorConfigMessage>>(this.configChannel, 'message',
      (ev) => ev?.data?.type === 'state' && ev?.data?.state?.initialization === 'running'
    );
    await this.initialize();
  }
  async reset(): Promise<void> {
    this._reset();
  }

  protected async _startCalibrating(): Promise<void> {
    this.sendCommand('startCalibrating');
    await eventToPromise<MessageEvent<SensorConfigMessage>>(this.configChannel, 'message',
      (ev) => ev?.data?.type === 'state' && ev?.data?.state?.calibrating === 'running'
    );
  }
  async startCalibrating(): Promise<void> {
    if (this.capabilities.calibratable) {
      await this._startCalibrating();
    }
  }

  protected async _stopCalibrating(): Promise<void> {
    this.sendCommand('stopCalibrating');
    await eventToPromise<MessageEvent<SensorConfigMessage>>(this.configChannel, 'message',
      (ev) => ev?.data?.type === 'state' && ev?.data?.state?.calibrating === 'stopped'
    );
  }
  async stopCalibrating(): Promise<void> {
    if (this.capabilities.calibratable) {
      await this._stopCalibrating();
    }
  }

  protected async _startRecording(): Promise<void> {
    this.sendCommand('startRecord');
    await eventToPromise<MessageEvent<SensorConfigMessage>>(this.configChannel, 'message',
      (ev) => ev?.data?.type === 'state' && ev?.data?.state?.recording === 'running'
    );
  }
  async startRecording(): Promise<void> {
    if (this.capabilities.recordable) {
      await this._startRecording();
    }
  }

  protected async _stopRecording(): Promise<void> {
    this.sendCommand('stopRecord');
    await eventToPromise<MessageEvent<SensorConfigMessage>>(this.configChannel, 'message',
      (ev) => ev?.data?.type === 'state' && ev?.data?.state?.recording === 'stopped'
    );
  }
  async stopRecording(): Promise<void> {
    if (this.capabilities.recordable) {
      await this._stopRecording();
    }
  }
}
