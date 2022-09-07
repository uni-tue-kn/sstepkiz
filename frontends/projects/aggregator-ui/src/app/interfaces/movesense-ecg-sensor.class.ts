import { SensorPropertyState } from '@sstepkiz';
import { Subscription } from 'rxjs';

import { BluetoothService } from '../services/bluetooth/bluetooth.service';
import { GattValueParserService } from '../services/gatt-value-parser/gatt-value-parser.service';
import { SensorPeerInterface } from './sensor-peer.interface';
import { Sensor } from './sensor.class';
import { EcgVoltageData } from './ecg-voltage-data';
import { EcgData } from './ecg-data';

export class MovesenseEcgSensor extends Sensor {

  /**
   * Connection state to sensor.
   */
  private sensorConnectionState: SensorPropertyState = 'stopped';

  /**
   * Subscription of changed hr data.
   */
  private dataChangedSubscription?: Subscription;
  /**
   * Subscription of changed ecg voltage data
   */
  private voltageChangedSubscription?: Subscription;
  /**
   * Subscription of changed new ecg voltage data
   */
  private newVoltageChangedSubscription?: Subscription;
  /*
   * Subscription of changed battery
   */
  private batteryChangedSubscription?: Subscription;
  /**
   * Subscription of disconnected bluetooth ECG device.
   */
  private sensorDisconnectedSubscription?: Subscription;

  /**
   * Connected data channel.
   */
  private dataChannel?: RTCDataChannel;
  /*
   * Connected voltage channel.
   */
  private voltageChannel?: RTCDataChannel;
  /**
   * Identity of ECG bluetooth device.
   */
  private deviceId?: string;
  /**
   * Handles closed data channel.
   * Also called on disconnect(), when data channel was not closed.
   */
  private readonly onDataChannelClose = () => {
    // Check if that data channel exists.
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
   * Handles closed voltage channel.
   * Also called on disconnect(), when data channel was not closed.
   */
  private readonly onVoltageChannelClose = () => {
    // Check if that data channel exists.
    if (this.voltageChannel) {
      // Unsubscribe from data channel close event.
      this.voltageChannel.removeEventListener('close', this.onVoltageChannelClose);
      // Remove data channel reference.
      this.voltageChannel = undefined;
      // Update connection state.
      this.sensorConnectionState = 'stopped';
    }
  };
  /**
   * Handles disconnected bluetooth ECG device.
   * @param deviceId Identity of bluetooth ECG device.
   */
  private readonly onDisconnected = (deviceId: string) => {
    // Ensure that disconnected device matches bluetooth ECG device.
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
   * Constructs a new Movesense ECG sensor.
   * @param type Type of sensor. Use 'ecg' here!
   * @param driver Name of driver.
   * @param id Identity of driver.
   * @param peerInterface Interface to interact with peer connection.
   * @param bluetooth Bluetooth ECG Service instance.
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
   * Connects to bluetooth ECG sensor.
   */
  protected async _connect(): Promise<void> {
    // Update device connection state.
    this.sensorConnectionState = 'starting';
    try {
      // Get data channel.
      this.dataChannel = await this.peerInterface.getChannel('data');
      // Start listening to close event of data channel.
      this.dataChannel.addEventListener('close', this.onDataChannelClose);
      // Get voltage channel.
      this.voltageChannel = await this.peerInterface.getChannel('voltage');
      // Start listening to close event of voltage channel.
      this.voltageChannel.addEventListener('close', this.onVoltageChannelClose);

      const devices = this.bluetooth.getDeviceIds();
      if (devices.length === 0) {
        // Connect to the bluetooth ecg sensor.
        const connection = await this.bluetooth.connect();
        if (!connection.ecg) {
          throw `Failed to connect to Bluetooth ECG Device`;
        }
        this.deviceId = connection.deviceId;
        this.parser.reset();
      } else {
        this.deviceId = devices[0];
      }

      // Subscribes to disconnection of bluetooth ecg sensor.
      this.sensorDisconnectedSubscription = this.bluetooth.disconnected.subscribe(this.onDisconnected);

      const device = this.bluetooth.getDevice(this.deviceId);

      // Subscribe and parse Battery state.
      this.batteryState = undefined;
      this.batteryChangedSubscription = this.bluetooth.ecg.batteryChange.subscribe((value) => {
        try {
          if(value.deviceId !== this.deviceId) {
            return;
          }
          // parse data
          this.batteryState = this.parser.getBatteryData(value.data);
        } catch (error) {
          console.error(`Failed to parse Battery value`, value);
        }
      });

      // Subscribe to disconnect.
      const onDisconnected = () => {
        try {
          device.removeEventListener('gattserverdisconnected', onDisconnected);
          this.batteryChangedSubscription?.unsubscribe();
          this.batteryChangedSubscription = undefined;
          this.batteryState = undefined;
          this.sensorConnectionState = 'failed';
        } catch (error) {
          console.error(`Failed to unsubscribe lost ECG device`, error, this);
        }
      };
      device.addEventListener('gattserverdisconnected', onDisconnected);

      // Update device connection state.
      this.sensorConnectionState = 'running';
    } catch (error) {
      // Log error message.
      console.error(error);
      // Update device connection state.
      this.sensorConnectionState = 'failed';
    }
    // Perform connection process on server side.
    // (Movesense ECG driver will not do anything)
    await super._connect();
  }
  /**
   * Disconnect from bluetooth ECG sensor.
   */
  protected async _disconnect(): Promise<void> {
    // Update connection state.
    this.sensorConnectionState = 'stopping';
    // Ensure that bluetooth ECG device is connected.
    if (this.deviceId) {
      // Disconnect from bluetooth ECG sensor.
      this.bluetooth.disconnect(this.deviceId);
    }
    // Stop listening to data channel close event and remove data channel.
    // Info: This does not close the data channel!
    this.onDataChannelClose();
    this.onVoltageChannelClose();
    // Update connection state.
    this.sensorConnectionState = 'stopped';
    this.batteryChangedSubscription?.unsubscribe();
    // Perform disconnect process on server side.
    // Info: Movesense ECG driver will not do anything!
    await super._disconnect();
  }

  /**
   * Initializes the Movesense ECG sensor.
   */
  protected async _initialize(): Promise<void> {
    // Subscribe to new Hr data.
    this.dataChangedSubscription = this.bluetooth.ecg.hrChange.subscribe((value) => {
      if (value.deviceId !== this.deviceId) {
        return;
      }
      // add hr data parsing and usage if required
    });

    //Subscribe to old ECG data
    this.voltageChangedSubscription = this.bluetooth.ecg.ecgChange.subscribe((value) => {
      if(value.deviceId !== this.deviceId) {
        return;
      }
      // Parse GATT voltage data
      var newData : EcgVoltageData[] = this.parser.parseEcgVoltageData(value.data);
      newData.forEach((d) => {
        this.voltageChannel?.send(JSON.stringify(d));
         let ecg = this.parser.calculateRRfromVoltage(d);
         if(ecg !== undefined && (ecg as EcgData).rrInterval) { // EcgData was returned
           this.dataChannel?.send(JSON.stringify(ecg));
         }
      });
    });
    // Subscribe to new ECG data
    this.newVoltageChangedSubscription = this.bluetooth.ecg.newEcgChange.subscribe((value) => {
      if (value.deviceId !== this.deviceId) {
        return;
      }
      // Parse GATT voltage data
      const newData: EcgVoltageData[] = this.parser.parseNewEcgVoltageData(value.data);
      newData.forEach((d) => {
        this.voltageChannel?.send(JSON.stringify(d));
        const ecg = this.parser.calculateRRfromVoltage(d);
        if (ecg !== undefined && (ecg as EcgData).rrInterval) {
          this.dataChannel?.send(JSON.stringify(ecg));
        }
      });
    });
    // Perform default initialization.
    await super._initialize();
  }
  /**
   * Terminates the Movesense ECG sensor.
   */
  protected async _terminate(): Promise<void> {
    // Ensure that changed data is subscribed.
    if (this.dataChangedSubscription) {
      // Unsubscribe from new ECG data.
      this.dataChangedSubscription.unsubscribe();
      // Remove stored subscription reference.
      this.dataChangedSubscription = undefined;
    }
    if (this.voltageChangedSubscription) {
      // Unsubscribe from new ECG data.
      this.voltageChangedSubscription.unsubscribe();
      // Remove stored subscription reference.
      this.voltageChangedSubscription = undefined;
    }
    if (this.newVoltageChangedSubscription) {
      this.newVoltageChangedSubscription.unsubscribe();
      this.newVoltageChangedSubscription = undefined;
    }
    if (this.batteryChangedSubscription) {
      this.batteryChangedSubscription.unsubscribe();
      this.batteryChangedSubscription = undefined;
    }
    // Perform default termination.
    await super._terminate();
  }
}
