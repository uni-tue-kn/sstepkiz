import { SensorPropertyState } from '@sstepkiz';
import { Subscription } from 'rxjs';

import { BluetoothService } from '../services/bluetooth/bluetooth.service';
import { GattValueParserService } from '../services/gatt-value-parser/gatt-value-parser.service';
import { SensorPeerInterface } from './sensor-peer.interface';
import { Sensor } from './sensor.class';
import { MovementData } from './movement-data';

export class MovesenseMovSensor extends Sensor {

  /**
   * Connection state to sensor.
   */
  private sensorConnectionState: SensorPropertyState = 'stopped';

  private newDataChangedSubscription?: Subscription;
  /**
   * Subscription of changed data.
   */
  private dataChangedSubscription?: Subscription;

  /**
   * Connected data channel for movement data
   */
  private dataChannel?: RTCDataChannel;
  /**
   * Identity of Mov bluetooth device.
   */
  private deviceId?: string;
  /**
   * Subscription of disconnected bluetooth Mov device.
   */
  private sensorDisconnectedSubscription?: Subscription;

  /*
   * Subscription of changed battery
   */
  private batteryChangedSubscription?: Subscription;
  /**
   * Handles closed data channel.
   * Also called on disconnect(), when data channel was not closed.
   */
  private readonly onDataChannelClose = () => {
    // Check if the other data channel exists.
    if (this.dataChannel) {
      // Unsubscribe from data channel close event.
      this.dataChannel.removeEventListener('close', this.onDataChannelClose);
      // Remove data channel reference.
      this.dataChannel = undefined;
      // Update connection state.
      this.sensorConnectionState = 'stopped';
    }
  };
  /**
   * Handles disconnected bluetooth Mov device.
   * @param deviceId Identity of bluetooth Mov device.
   */
  private readonly onDisconnected = (deviceId: string) => {
    // Ensure that disconnected device matches bluetooth Mov device.
    if (deviceId !== this.deviceId) {
      return;
    }
    // Remove stored bluetooth device identity.
    this.deviceId = undefined;
    this.sensorConnectionState='stopped';
    if (this.sensorDisconnectedSubscription) {
      // Stop disconnect subscription.
      this.sensorDisconnectedSubscription.unsubscribe();
      // Remove disconnect subscription.
      this.sensorDisconnectedSubscription = undefined;
    }
  };

  /**
   * Gets the connection state of the sensor.
   */
  get connectionState(): SensorPropertyState {
    if (this.sensorConnectionState === 'failed' || super.connectionState === 'failed') {
      return 'failed';
    }
    if (this.sensorConnectionState === 'stopping' || super.connectionState === 'stopping') {
      return 'stopping';
    }
    if (this.sensorConnectionState === 'starting' || super.connectionState === 'starting') {
      return 'starting';
    }
    if (this.sensorConnectionState === 'stopped' || super.connectionState === 'stopped') {
      return 'stopped';
    }
    return 'running';
  }

  /**
   * Constructs a new Movesense Mov sensor.
   * @param type Type of sensor. Use 'Mov' here!
   * @param driver Name of driver.
   * @param id Identity of driver.
   * @param peerInterface Interface to interact with peer connection.
   * @param bluetooth Bluetooth Mov Service instance.
   * @param parser Gatt Value Parser Service instance.
   */
  constructor(
    type: string,
    driver: string,
    id: string,
    peerInterface: SensorPeerInterface,
    private readonly bluetooth: BluetoothService,
    private readonly parser: GattValueParserService
  ) {
    super(type, driver, id, peerInterface);
  }

  /**
   * Connects to bluetooth Mov sensor.
   */
  protected async _connect(): Promise<void> {
    // Update device connection state.
    this.sensorConnectionState = 'starting';
    try {
      // Get data channel.
      this.dataChannel = await this.peerInterface.getChannel('movData');
      // Start listening to close event of data channel.
      this.dataChannel.addEventListener('close', this.onDataChannelClose);
      const devices = this.bluetooth.getDeviceIds();
      if (devices.length === 0) {
        // Connect to the bluetooth Mov sensor.
        const connection = await this.bluetooth.connect();
        if (!connection.mov) {
          throw `Failed to connect to Movement sensor!`;
        }
        this.deviceId = connection.deviceId;
        this.parser.reset();
      } else {
        this.deviceId = devices[0];
      }
      // Subscribes to disconnection of bluetooth Mov sensor.
      this.sensorDisconnectedSubscription = this.bluetooth.disconnected.subscribe(this.onDisconnected);

      //already subscribe battery
      this.batteryChangedSubscription = this.bluetooth.ecg.batteryChange.subscribe((value) => {
        if(value.deviceId!==this.deviceId) {
          return;
        }

        //parse data
        this.batteryState = this.parser.getBatteryData(value.data);
      });
      if (this.bluetooth.ecg.lastBatteryValue)
        this.batteryState = this.parser.getBatteryData(this.bluetooth.ecg.lastBatteryValue);

      // Update device connection state.
      this.sensorConnectionState = 'running';
    } catch (error) {
      // Log error message.
      console.error(error);
      // Update device connection state.
      this.sensorConnectionState = 'failed';
    }
    // Perform connection process on server side.
    // (Movesense Mov driver will not do anything)
    await super._connect();
  }
  /**
   * Disconnect from bluetooth Mov sensor.
   */
  protected async _disconnect(): Promise<void> {
    // Update connection state.
    this.sensorConnectionState = 'stopping';
    // Ensure that bluetooth Mov device is connected.
    if (this.deviceId) {
      // Disconnect from bluetooth Mov sensor.
      this.bluetooth.disconnect(this.deviceId);
    }
    // Stop listening to data channel close event and remove data channel.
    // Info: This does not close the data channel!
    this.onDataChannelClose();
    // Update connection state.
    this.sensorConnectionState = 'stopped';
    this.batteryChangedSubscription?.unsubscribe();
    // Perform disconnect process on server side.
    // Info: Movesense Mov driver will not do anything!
    await super._disconnect();
  }

  /**
   * Initializes the Movesense Mov sensor.
   */
  protected async _initialize(): Promise<void> {
    // Subscribe to new Movement data.
    this.newDataChangedSubscription = this.bluetooth.mov.newMovChange.subscribe(
      (value) => {
        if (value.deviceId !== this.deviceId) {
          return;
        }
        if (value !== undefined) {
          // Parse GATT encoded data to Mov data.
          var newData : MovementData[][] = this.parser.parseNewMovementData(value.data);
          const accData = newData[0];
          const gyrData = newData[1];
          const magData = newData[2];
          const deviceId = 'movesense_' + atob(value.deviceId).split('').map(t => t.charCodeAt(0)).map(n => n.toString(16)).join(':');
          // Send JSON-encoded data to server.
          let message : string = JSON.stringify(accData)+"|"+JSON.stringify(gyrData)+"|"+JSON.stringify(magData)+"|"+deviceId+"|"+Date.now();
          if (this.dataChannel) {
            this.dataChannel.send(message);
          } else {
            console.error(`Failed to send movement data to backend: ${message}`);
          }
        }
      }
    );
    // Subscribe to new Movement data.
    this.dataChangedSubscription = this.bluetooth.mov.movChange.subscribe(
      (value) => {
        if (value.deviceId !== this.deviceId) {
          return;
        }
        if (value !== undefined) {
          // Parse GATT encoded data to Mov data.
          var newData : MovementData[][] = this.parser.parseMovementData(value.data);
          const accData = newData[0];
          const gyrData = newData[1];
          const magData = newData[2];
          const deviceId = 'movesense_' + atob(value.deviceId).split('').map(t => t.charCodeAt(0)).map(n => n.toString(16)).join(':');
          // Send JSON-encoded data to server.
          let message : string = JSON.stringify(accData)+"|"+JSON.stringify(gyrData)+"|"+JSON.stringify(magData)+"|"+deviceId+"|"+Date.now();
          if (this.dataChannel) {
            this.dataChannel.send(message);
          } else {
            console.error(`Failed to send movement data to backend: ${message}`);
          }
        }
      }
    );
    // Perform default initialization.
    await super._initialize();
  }
  /**
   * Terminates the Movesense Mov sensor.
   */
  protected async _terminate(): Promise<void> {
    // Ensure that changed data is subscribed.
    if (this.dataChangedSubscription) {
      // Unsubscribe from new Mov data.
      this.dataChangedSubscription.unsubscribe();
      // Remove stored subscription reference.
      this.dataChangedSubscription = undefined;
    }
    // Perform default termination.
    await super._terminate();
  }
}
