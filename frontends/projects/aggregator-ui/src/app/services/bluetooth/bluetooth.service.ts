import { EventEmitter, Injectable } from '@angular/core';

import { BluetoothEcgService } from './bluetooth-ecg.service';
import { BluetoothMovService } from './bluetooth-mov.service';

const SERVICE_NAME_BATTERY = 0x180F; // Battery Service
const CHARACTERISTIC_NAME_BATTERY = 0x2A19; // Battery Characteristic.

const SERVICE_NAME_ACTIVITY_OLD = 0x1821; // Old Activity Service.
const CHARACTERISTIC_NAME_ECG_OLD = 0x2A37;//heart rate measurement
const CHARACTERISTIC_NAME_MOV_OLD = 0x2A67; //location and speed

const SERVICE_NAME_ACTIVITY = 0x1859; // New Activity Service.
const CHARACTERISTIC_NAME_ACTIVITY_ECG = 0x2BDD; // ECG Activity.
const CHARACTERISTIC_NAME_ACTIVITY_MOV = 0x2BE2; // Movement Activity.

const REQUEST_DEVICE_OPTIONS = {
  filters: [{
    namePrefix: 'Movesense'
  }],
  optionalServices: [
    SERVICE_NAME_BATTERY,
    SERVICE_NAME_ACTIVITY_OLD,
    SERVICE_NAME_ACTIVITY,
  ]
};

@Injectable({ providedIn: 'root' })
export class BluetoothService {

  public readonly ecg : BluetoothEcgService = new BluetoothEcgService();
  public readonly mov: BluetoothMovService = new BluetoothMovService();

  // Events.
  /**
   * Emits device identities of disconnected bluetooth devices.
   */
  readonly disconnected = new EventEmitter<string>();

  // Mappings of devices and GATT servers.
  /**
   * Mapping of bluetooth device identities to connected bluetooth device.
   */
  private readonly _connectedDevices: { [id: string]: BluetoothDevice } = {};
  /**
   * Mapping of bluetooth device identities to related GATT servers.
   */
  private readonly _connectedServers: { [id: string]: BluetoothRemoteGATTServer } = {};

  // Management of mappings.
  /**
   * Adds a device to array of connected devices and connected GATT servers.
   * @param device Bluetooth device to add.
   * @param server GATT server to add.
   */
  private addDevice(device: BluetoothDevice, server: BluetoothRemoteGATTServer): void {
    this._connectedDevices[device.id] = device;
    this._connectedServers[device.id] = server;
  }
  /**
   * Checks if a device is in mapping to bluetooth devices and to GATT servers by the device's identities.
   * @param deviceId Identity of bluetooth device.
   * @returns true = contained, false = not contained.
   */
  private containsDevice(deviceId: string): boolean {
    return deviceId in this._connectedDevices && deviceId in this._connectedServers;
  }
  /**
   * Removes a bluetooth device from mapping to servers and devices.
   * @param deviceId Identity of bluetooth device to remove.
   */
  private removeDevice(deviceId: string): void {
    if (deviceId in this._connectedDevices) {
      delete this._connectedDevices[deviceId];
    }
    if (deviceId in this._connectedServers) {
      delete this._connectedServers[deviceId];
    }
  }

  public getDeviceIds(): string[] {
    return Object.keys(this._connectedDevices);
  }
  public getDevice(deviceId: string): BluetoothDevice | undefined {
    if (this.containsDevice(deviceId)) {
      return this._connectedDevices[deviceId];
    } else {
      return undefined;
    }
  }

  // Management of WebBluetooth API.
  /**
   * Requests connection to a ECG bluetooth device.
   * @returns Selected bluetooth device.
   */
  private async requestDevice(): Promise<BluetoothDevice> {
    try {
      if (!navigator.bluetooth) {
        throw 'Your browser does not support the WebBluetooth API!';
      }
      let device: BluetoothDevice | undefined;
      try {
        device = await navigator.bluetooth.requestDevice(REQUEST_DEVICE_OPTIONS);
      } catch (error) {
        device = undefined;
        throw `Request Error: ${JSON.stringify(error)}`;
      }
      if (!device) {
        throw 'No device selected!';
      }
      return device;
    } catch (error) {
      throw `Failed to request device: ${error}`;
    }
  }
  /**
   * Connects to the GATT server of a bluetooth device.
   * @param device Bluetooth device to connect.
   * @returns Connected GATT server.
   */
  private async connectGattServer(device: BluetoothDevice): Promise<BluetoothRemoteGATTServer> {
    try {
      let server: BluetoothRemoteGATTServer | undefined;
      try {
        server = await device.gatt.connect();
      } catch (error) {
        throw `Connect Error: ${JSON.stringify(error)}`;
      }
      if (!server) {
        throw 'GATT Server not found!';
      }
      return server;
    } catch (error) {
      throw `Failed to connect to GATT Server: ${error}`;
    }
  }
  /**
   * Gets the ECG GATT service of a GATT server.
   * @param server Bluetooth GATT server to get the service of.
   * @returns ECG GATT service.
   */
  private async getService(server: BluetoothRemoteGATTServer, serviceUUID : number): Promise<BluetoothRemoteGATTService> {
    try {
      let service: BluetoothRemoteGATTService | undefined;
      try {
        service = await server.getPrimaryService(serviceUUID);
      } catch (error) {
        throw `Connect Error: ${JSON.stringify(error)}`;
      }
      if (!service) {
        throw 'Service not found!';
      }
      return service;
    } catch (error) {
      throw `Failed to get GATT Service: ${error}`;
    }
  }
  /**
   * Gets the ECG GATT characteristic of an ECG GATT service.
   * @param service GATT service to get characteristic of.
   * @returns ECG GATT characteristic.
   */
  private async getCharacteristic(service: BluetoothRemoteGATTService,chooseCharacteristic : number): Promise<BluetoothRemoteGATTCharacteristic> {
    try {
      let characteristic: BluetoothRemoteGATTCharacteristic | undefined;
      try {
        characteristic = await service.getCharacteristic(chooseCharacteristic);
      } catch (error) {
        throw `Connect Error: ${JSON.stringify(error)}`;
      }
      if (!characteristic) {
        throw 'characteristic not found!';
      }
      return characteristic;
    } catch (error) {
      throw `Failed to get GATT Characteristic: `+error;
    }
  }

  // ECG device API calls.
  /**
   * Connects to a bluetooth ECG device.
   * @throws Description of failure.
   */
  public async connect(): Promise<{ deviceId: string, ecg: boolean, mov: boolean, battery: boolean }> {
    try {
      // Select device.
      let device: BluetoothDevice | undefined = undefined;
      try {
        // Request connection to bluetooth ecg devices.
        device = await this.requestDevice();
      } catch (error) {
        throw `Failed to connect to device: ${error}`;
      }

      // Ensure that device is not already connected.
      if (this.containsDevice(device.id)) {
        device = this._connectedDevices[device.id];
      }

      // Connect to GATT Server.
      let server: BluetoothRemoteGATTServer | undefined = undefined;
      try {
        // Connect to GATT server.
        server = await this.connectGattServer(device);
      } catch (error) {
        console.log(`Failed to connect to server of device! Forgetting device...`, device);
        try {
          await device.forget();
          device = undefined;
        } catch (error) {
          console.error(`Failed to forget device`, device);
        }
        throw `Failed to connect to Server: ${error}`;
      }

      // Try to connect Battery service + characteristics.
      let batteryService: BluetoothRemoteGATTService | undefined = undefined;
      try {
        batteryService = await this.getService(server, SERVICE_NAME_BATTERY);
      } catch (error) {
        batteryService = undefined;
        console.warn(`Battery service not found: ${error}`);
      }
      let batteryChar: BluetoothRemoteGATTCharacteristic | undefined = undefined;
      if (batteryService) {
        try {
          batteryChar = await this.getCharacteristic(batteryService, CHARACTERISTIC_NAME_BATTERY);
        } catch (error) {
          batteryChar = undefined;
          console.error(`Battery service found but not Battery characteristic: ${error}`)
        }
      }
      
      // Try to connect old Activity service + characteristics.
      let oldActivityService: BluetoothRemoteGATTService | undefined = undefined;
      try {
        oldActivityService = await this.getService(server, SERVICE_NAME_ACTIVITY_OLD);
      } catch (error) {
        oldActivityService = undefined;
        console.log(`Old Activity service not found: ${error}`);
      }
      let oldEcgChar: BluetoothRemoteGATTCharacteristic | undefined = undefined;
      let oldMovChar: BluetoothRemoteGATTCharacteristic | undefined = undefined;
      if (oldActivityService) {
        try {
          oldEcgChar = await this.getCharacteristic(oldActivityService, CHARACTERISTIC_NAME_ECG_OLD);
        } catch (error) {
          oldEcgChar = undefined;
          console.error(`Old Activity service found but not old ECG characteristic: ${error}`);
        }
        try {
          oldMovChar = await this.getCharacteristic(oldActivityService, CHARACTERISTIC_NAME_MOV_OLD);
        } catch (error) {
          oldMovChar = undefined;
          console.error(`Old Activity service found but not old Movement characteristic: ${error}`);
        }
      }

      // Try to connect new Activity service + characteristics.
      let newActivityService: BluetoothRemoteGATTService | undefined = undefined;
      try {
        newActivityService = await this.getService(server, SERVICE_NAME_ACTIVITY);
      } catch (error) {
        newActivityService = undefined;
        console.log(`New Activity service not found: ${error}`);
      }
      let newEcgChar: BluetoothRemoteGATTCharacteristic | undefined = undefined;
      let newMovChar: BluetoothRemoteGATTCharacteristic | undefined = undefined;
      if (newActivityService) {
        try {
          newEcgChar = await this.getCharacteristic(newActivityService, CHARACTERISTIC_NAME_ACTIVITY_ECG);
        } catch (error) {
          newEcgChar = undefined;
          console.error(`New Activity service found but not new ECG characteristic: ${error}`);
        }
        try {
          newMovChar = await this.getCharacteristic(newActivityService, CHARACTERISTIC_NAME_ACTIVITY_MOV);
        } catch (error) {
          newMovChar = undefined;
          console.error(`New Activity service found but not new Movement characteristic: ${error}`);
        }
      }

      // Connect ECG Characteristic.
      if (newEcgChar) {
        this.ecg.connectNewEcg(newEcgChar, device);
      } else if (oldEcgChar) {
        this.ecg.connectEcg(oldEcgChar, device);
      } else {
        console.warn(`No ECG device connected!`);
      }

      // Connect Movement Characteristic.
      if (newMovChar) {
        this.mov.connectMovNew(newMovChar, device);
      } else if (oldMovChar) {
        this.mov.connectMov(oldMovChar, device);
      } else {
        console.warn(`No Movement device connected!`);
      }

      // Connect Battery Characteristic.
      if (batteryChar) {
        this.ecg.connectBattery(batteryChar, device);
      } else {
        console.warn(`No Battery device connected`);
      }

      // Subscribe disconnection.
      const onServerDisconnected = () => {
        if(device) {
          // GATT server disconnected -> Stop listening to changed characteristic value, removed service and disconnected GATT server.
          device.removeEventListener('gattserverdisconnected', onServerDisconnected);
          // Remove device from connected devices.
          this.removeDevice(device.id);
          // Emit disconnected event.
          this.disconnected.emit(device.id);
          console.warn("GATT Server disconnected!", device);
        }
      };
      device.addEventListener('gattserverdisconnected', onServerDisconnected);

      // Add device to connected devices.
      this.addDevice(device, server);

      // Return the connected device.
      return {
        deviceId: device.id,
        ecg: (!!oldEcgChar || !!newEcgChar),
        mov: (!!oldMovChar || !!newMovChar),
        battery: !!batteryChar,
      };
    } catch (error) {
      throw `Failed to connect to Bluetooth Device: ${error}`;
    }
  }
  /**
   * Disconnects from a bluetooth ECG device.
   * @param deviceId Identity of bluetooth device to disconnect.
   */
  disconnect(deviceId: string): void {
    if (!this.containsDevice(deviceId)) return;
    this._connectedServers[deviceId]?.disconnect();
  }
  /**
   * Gets if a bluetooth ECG device is connected.
   * @param deviceId Identity of bluetooth device.
   * @returns true = connected, false = not connected.
   */
  isConnected(deviceId: string): boolean {
    return this.containsDevice(deviceId) && this._connectedServers[deviceId]?.connected;
  }
}
