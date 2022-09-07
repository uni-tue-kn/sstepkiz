/// <reference types="web-bluetooth" />
import { Observable } from 'rxjs';
import { ConsoleLoggerService } from './logger.service';
import { BrowserWebBluetooth } from './platform/browser';
declare type ReadValueOptions = {
    acceptAllDevices?: boolean;
    optionalServices?: BluetoothServiceUUID[];
    characteristic: BluetoothCharacteristicUUID;
    service: BluetoothServiceUUID;
};
export declare class BluetoothCore {
    private readonly webBle;
    private readonly console;
    private device$;
    private gatt$;
    private characteristicValueChanges$;
    private gattServer;
    constructor(webBle: BrowserWebBluetooth, console: ConsoleLoggerService);
    getDevice$(): Observable<BluetoothDevice>;
    getGATT$(): Observable<BluetoothRemoteGATTServer>;
    streamValues$(): Observable<DataView>;
    /**
     * Run the discovery process and read the value form the provided service and characteristic
     * @param options the ReadValueOptions
     */
    value(options: ReadValueOptions): Promise<DataView>;
    value$(options: ReadValueOptions): Observable<DataView>;
    /**
     * Run the discovery process.
     *
     * @param Options such as filters and optional services
     * @return  The GATT server for the chosen device
     */
    discover(options?: RequestDeviceOptions): Promise<any>;
    /**
     * This handler will trigger when the client disconnets from the server.
     *
     * @param event The onDeviceDisconnected event
     */
    onDeviceDisconnected(event: Event): void;
    /**
     * Run the discovery process.
     *
     * @param Options such as filters and optional services
     * @return  Emites the value of the requested service read from the device
     */
    discover$(options?: RequestDeviceOptions): Observable<void | BluetoothRemoteGATTServer>;
    /**
     * Connect to current device.
     *
     * @return  Emites the gatt server instance of the requested device
     */
    connectDevice(device: BluetoothDevice): Promise<BluetoothRemoteGATTServer>;
    /**
     * Connect to current device.
     *
     * @return  Emites the gatt server instance of the requested device
     */
    connectDevice$(device: BluetoothDevice): Observable<BluetoothRemoteGATTServer>;
    /**
     * Disconnect the current connected device
     */
    disconnectDevice(): void;
    /**
     * Requests the primary service.
     *
     * @param gatt The BluetoothRemoteGATTServer sever
     * @param service The UUID of the primary service
     * @return The remote service (as a Promise)
     */
    getPrimaryService(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
    /**
     * Requests the primary service.
     *
     * @param gatt The BluetoothRemoteGATTServer sever
     * @param service The UUID of the primary service
     * @return The remote service (as an observable).
     */
    getPrimaryService$(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Observable<BluetoothRemoteGATTService>;
    /**
     * Requests a characteristic from the primary service.
     *
     * @param primaryService The primary service.
     * @param characteristic The characteristic's UUID.
     * @returns The characteristic description (as a Promise).
     */
    getCharacteristic(primaryService: BluetoothRemoteGATTService, characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic | void>;
    /**
     * Requests a characteristic from the primary service.
     *
     * @param primaryService The primary service.
     * @param characteristic The characteristic's UUID.
     * @returns The characteristic description (as a Observable).
     */
    getCharacteristic$(primaryService: BluetoothRemoteGATTService, characteristic: BluetoothCharacteristicUUID): Observable<void | BluetoothRemoteGATTCharacteristic>;
    /**
     * Sets the characteristic's state.
     *
     * @param service The parent service of the characteristic.
     * @param characteristic The requested characteristic
     * @param state An ArrayBuffer containing the value of the characteristic.
     * @return The primary service (useful for chaining).
     */
    setCharacteristicState(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state: ArrayBuffer): Observable<BluetoothRemoteGATTService>;
    /**
     * Enables the specified characteristic of a given service.
     *
     * @param service The parent service of the characteristic.
     * @param characteristic The requested characteristic
     * @return The primary service (useful for chaining).
     */
    enableCharacteristic(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state?: any): Observable<BluetoothRemoteGATTService>;
    /**
     * Disables the specified characteristic of a given service.
     *
     * @param service The parent service of the characteristic.
     * @param characteristic The requested characteristic.
     * @return The primary service (useful for chaining).
     */
    disbaleCharacteristic(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state?: any): Observable<BluetoothRemoteGATTService>;
    /**
     * Dispatches new values emitted by a characteristic.
     *
     * @param event the distpatched event.
     */
    onCharacteristicChanged(event: Event): void;
    /**
     * Reads a value from the characteristics, as a DataView.
     *
     * @param characteristic The requested characteristic.
     * @return the DataView value (as an Observable).
     */
    readValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView>;
    /**
     * Writes a value into the specified characteristic.
     *
     * @param characteristic The requested characteristic.
     * @param value The value to be written (as an ArrayBuffer or Uint8Array).
     * @return an void Observable.
     */
    writeValue$(characteristic: BluetoothRemoteGATTCharacteristic, value: ArrayBuffer | Uint8Array): Observable<void>;
    /**
     * A stream of DataView values emitted by the specified characteristic.
     *
     * @param characteristic The characteristic which value you want to observe
     * @return The stream of DataView values.
     */
    observeValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView>;
    /**
     * A utility method to convert LE to an unsigned 16-bit integer values.
     *
     * @param data The DataView binary data.
     * @param byteOffset The offset, in byte, from the start of the view where to read the data.
     * @return An unsigned 16-bit integer number.
     */
    littleEndianToUint16(data: any, byteOffset: number): number;
    /**
     * A utility method to convert LE to an unsigned 8-bit integer values.
     *
     * @param data The DataView binary data.
     * @param byteOffset The offset, in byte, from the start of the view where to read the data.
     * @return An unsigned 8-bit integer number.
     */
    littleEndianToUint8(data: any, byteOffset: number): number;
    /**
     * Sends random data (for testing purposes only).
     *
     * @return Random unsigned 8-bit integer values.
     */
    fakeNext(fakeValue?: () => DataView): void;
}
export {};
