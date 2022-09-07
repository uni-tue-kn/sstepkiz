import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BluetoothEcgService {

  // Emits changed hr data
  readonly hrChange = new EventEmitter<{ data: DataView, deviceId: string }>();
  // Emits changed ecg data
  readonly ecgChange = new EventEmitter<{ data: DataView, deviceId: string}>();
  // Emits changed new ecg data
  readonly newEcgChange = new EventEmitter<{ data: DataView, deviceId: string}>();
  //Emits changed battery data
  readonly batteryChange = new EventEmitter<{ data: DataView, deviceId: string }>();

  public lastBatteryValue: DataView;
  private batteryInterval?: number;

  /**
   * Starts listening to GATT characteristic notification.
   * @param characteristic ECG GATT characteristic.
   */
  private async startNotifications(characteristic: BluetoothRemoteGATTCharacteristic): Promise<void> {
    try {
      await characteristic.startNotifications();
    } catch (error) {
      throw `Failed to start notifications: `+error;
    }
  }

  async connectBattery(batteryCharacteristic: BluetoothRemoteGATTCharacteristic, device: BluetoothDevice) {
    console.log(`Connecting to battery characteristic`);
    // Prepare listener callbacks.
    const onBatteryCharacteristicValueChanged = (evt: any) => {
      try {
        // Extract new value.
        const value = evt?.target?.value;
        // Ensure that value is not empty.
        if (!value) {
          console.error('BatteryCharacteristic value changed but no value', evt);
          return;
        }
        // Emit new data.
        this.lastBatteryValue = value;
        this.batteryChange.emit({
          data: value,
          deviceId: device.id
        });
      } catch (error) {
        console.error(`Failed to handle battery characteristic value`, error);
      }
    };
    const onBatteryRequestTimeout = async () => {
      try {
        const value = await batteryCharacteristic.readValue();
        this.lastBatteryValue = value;
        this.batteryChange.emit({
          data: value,
          deviceId: device.id
        });
      } catch (error) {
        console.error(`Failed to request battery info`, error);
      }
    };
    const onServerDisconnected = () => {
      try {
        if (this.batteryInterval !== undefined) {
          clearTimeout(this.batteryInterval);
        }
        // GATT server disconnected -> Stop listening to changed characteristic value, removed service and disconnected GATT server.
        if (batteryCharacteristic) {
          batteryCharacteristic.removeEventListener('characteristicvaluechanged', onBatteryCharacteristicValueChanged);
          device.removeEventListener('gattserverdisconnected', onServerDisconnected);
        }
        console.log(`Battery GATT Server disconnected`);
      } catch (error) {
        console.error(`Failed to disconnect from lost battery sensor`, error);
      }
    };

    try {
      // Subscribe to callbacks.
      device.addEventListener('gattserverdisconnected', onServerDisconnected);
      batteryCharacteristic.addEventListener('characteristicvaluechanged', onBatteryCharacteristicValueChanged);
      if (this.batteryInterval === undefined) {
        this.batteryInterval = setInterval(onBatteryRequestTimeout, 60000);
      }
    } catch (error) {
      console.error(`Failed to subscribe battery characteristic events:`, error);
    }
    try {
      await this.startNotifications(batteryCharacteristic);
    } catch (error) {
      console.error(`Failed to start battery notifications.`)
    }
    onBatteryRequestTimeout();
  }
  async connectNewEcg(ecgCharacteristic: BluetoothRemoteGATTCharacteristic, device: BluetoothDevice) {
    console.log(`Connecting to new ECG characteristic`, ecgCharacteristic);
    const onEcgCharacteristicValueChanged = (evt: any) => {
      try {
        // Extract new value.
        const value = evt?.target?.value;
        // Ensure that value is not empty.
        if (!value) {
          console.error(`Empty ECG Characteristic`, evt, ecgCharacteristic);
          return;
        }
        // Emit new data.
        const event = {
          data: value,
          deviceId: device.id
        };
        this.newEcgChange.emit(event);
      } catch (error) {
        console.error(`Failed to handle received ecg value`, error, ecgCharacteristic);
      }
    };
    const onServerDisconnected = () => {
      try {
        // GATT server disconnected -> Stop listening to changed characteristic value, removed service and disconnected GATT server.
        if (ecgCharacteristic) {
          ecgCharacteristic.removeEventListener('characteristicvaluechanged', onEcgCharacteristicValueChanged);
          device.removeEventListener('gattserverdisconnected', onServerDisconnected);
        }
        console.log(`ECG GATT Server disconnected`);
      } catch (error) {
        console.error(`Failed to disconnect from lost ECG sensor`, error, ecgCharacteristic, device);
      }
    };

    try {
      ecgCharacteristic.addEventListener('characteristicvaluechanged', onEcgCharacteristicValueChanged);
      device.addEventListener('gattserverdisconnected', onServerDisconnected);
    } catch (error) {
      console.error(`Failed to subscribe ECG characteristic events:`, error, ecgCharacteristic, device);
    }
    try {
      await this.startNotifications(ecgCharacteristic);
    } catch (error) {
      console.error(`Failed to start ECG notifications:`, error, ecgCharacteristic);
    }
  }
  async connectEcg(ecgCharacteristic: BluetoothRemoteGATTCharacteristic, device: BluetoothDevice) {
    console.log(`Connecting to old ECG characteristic`, ecgCharacteristic);
    const onEcgCharacteristicValueChanged = (evt: any) => {
      try {
        // Extract new value.
        const value = evt?.target?.value;
        // Ensure that value is not empty.
        if (!value) {
          console.error(`Empty old ECG Characteristic`, evt, ecgCharacteristic);
          return;
        }
        // Emit new data.
        const event = {
          data: value,
          deviceId: device.id
        };
        this.ecgChange.emit(event);
      } catch (error) {
        console.error(`Failed to handle received old ecg value`, error, ecgCharacteristic);
      }
    };
    const onServerDisconnected = () => {
      try {
        // GATT server disconnected -> Stop listening to changed characteristic value, removed service and disconnected GATT server.
        if (ecgCharacteristic) {
          ecgCharacteristic.removeEventListener('characteristicvaluechanged', onEcgCharacteristicValueChanged);
          device.removeEventListener('gattserverdisconnected', onServerDisconnected);
        }
        console.log(`Old ECG GATT Server disconnected`);
      } catch (error) {
        console.error(`Failed to disconnect from lost old ECG sensor`, error, ecgCharacteristic, device);
      }
    };

    try {
      ecgCharacteristic.addEventListener('characteristicvaluechanged', onEcgCharacteristicValueChanged);
      device.addEventListener('gattserverdisconnected', onServerDisconnected);
    } catch (error) {
      console.error(`Failed to subscribe old ECG characteristic events:`, error, ecgCharacteristic, device);
    }
    try {
      await this.startNotifications(ecgCharacteristic);
    } catch (error) {
      console.error(`Failed to start old ECG notifications:`, error, ecgCharacteristic);
    }
  }
}
