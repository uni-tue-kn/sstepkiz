/// <reference types="web-bluetooth" />
export declare class BrowserWebBluetooth {
    private ble;
    constructor();
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
}
