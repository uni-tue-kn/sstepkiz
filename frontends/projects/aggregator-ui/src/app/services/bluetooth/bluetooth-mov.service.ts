import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BluetoothMovService {

  /**
   * Emits changed movement state
   */
  readonly movChange = new EventEmitter<{ data: DataView, deviceId: string }>();
  /**
   * Emits changed movement state
   */
  readonly newMovChange = new EventEmitter<{ data: DataView, deviceId: string }>();

  /**
   * Starts listening to GATT characteristic notification.
   * @param characteristic ECG GATT characteristic
   */
  private async startNotifications(characteristic: BluetoothRemoteGATTCharacteristic): Promise<void> {
    try {
      await characteristic.startNotifications();
    } catch (error) {
      throw `Failed to start notifications: ${error}`;
    }
  }

  /**
   * Connects to a bluetooth ECG device.
   * @returns Identity of bluetooth device.
   * @throws Description of failure.
   */
  async connectMovNew(movCharacteristic: BluetoothRemoteGATTCharacteristic, device: BluetoothDevice) {
    console.log('connecting with new mov characteristic', movCharacteristic);
    // Prepare listener callbacks.
    const onMovCharacteristicValueChanged = (evt: any) => {
      try {
        // Extract new value.
        const value = evt?.target?.value;
        // Ensure that value is not empty.
        if (!value) {
          console.error('MovCharacteristic value changed but no value', evt, movCharacteristic);
          return;
        }
        // Emit new data.
        const event = {
          data: value,
          deviceId: device.id
        };
        this.newMovChange.emit(event);
      } catch (error) {
        console.error(`Failed to handle received movement value`, error, movCharacteristic);
      }
    };
    const onServerDisconnected = () => {
      try {
        // GATT server disconnected -> Stop listening to changed characteristic value, removed service and disconnected GATT server.
        if (movCharacteristic) {
          movCharacteristic.removeEventListener('characteristicvaluechanged', onMovCharacteristicValueChanged);
          device.removeEventListener('gattserverdisconnected', onServerDisconnected);
        }
        console.log(`Movement GATT Server disconnected`);
      } catch (error) {
        console.error(`Failed to disconnect from lost movement sensor`, error, movCharacteristic);
      }
    };

    try {
      // Subscribe to callbacks.
      movCharacteristic.addEventListener('characteristicvaluechanged', onMovCharacteristicValueChanged);
      device.addEventListener('gattserverdisconnected', onServerDisconnected);
    } catch (error) {
      console.error(`Failed to subscribe movement characteristic events:`, error, movCharacteristic, device);
    }
    try {
      // Start data change notification.
      await this.startNotifications(movCharacteristic);
    } catch (error) {
      console.error(`Failed to start movement notifications`, error, movCharacteristic);
    }
  }
  /**
  * Connects to a bluetooth ECG device.
  * @returns Identity of bluetooth device.
  * @throws Description of failure.
  */
  async connectMov(movCharacteristic: BluetoothRemoteGATTCharacteristic, device: BluetoothDevice) {
    console.log('connecting with mov characteristic', movCharacteristic);
    // Prepare listener callbacks.
    const onMovCharacteristicValueChanged = (evt: any) => {
      try {
        // Extract new value.
        const value = evt?.target?.value;
        // Ensure that value is not empty.
        if (!value) {
          console.error('MovCharacteristic value changed but no value', evt, movCharacteristic);
          return;
        }
        // Emit new data.
        const event = {
          data: value,
          deviceId: device.id
        };
        this.movChange.emit(event);
      } catch (error) {
        console.error(`Failed to handle old movement characteristic value`, error, movCharacteristic);
      }
    };
    const onServerDisconnected = () => {
      try {
        // GATT server disconnected -> Stop listening to changed characteristic value, removed service and disconnected GATT server.
        if (movCharacteristic) {
          movCharacteristic.removeEventListener('characteristicvaluechanged', onMovCharacteristicValueChanged);
          device.removeEventListener('gattserverdisconnected', onServerDisconnected);
        }
        console.log(`Old Movement GATT Server disconnected`);
      } catch (error) {
        console.error(`Failed to disconnect from lost old movement sensor`, error, movCharacteristic);
      }
    };

    try {
      // Subscribe to callbacks.
      movCharacteristic.addEventListener('characteristicvaluechanged', onMovCharacteristicValueChanged);
      device.addEventListener('gattserverdisconnected', onServerDisconnected);
    } catch (error) {
      console.error(`Failed to subscribe old movement characteristic events:`, error, movCharacteristic, device);
    }
    try {
      // Start data change notification.
      await this.startNotifications(movCharacteristic);
    } catch (error) {
      console.error(`Failed to start old movement notifications`, error, movCharacteristic);
    }
  }
}
