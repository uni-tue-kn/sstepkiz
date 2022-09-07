import { Injectable } from '@nestjs/common';
import * as usbDetectionTypes from 'usb-detection';
import { Observable } from 'rxjs';
import { LoggerService } from '@libs/logger';
import { UsbDeviceChange } from './usb-device-change.type';

const usbDetection = require('usb-detection');

@Injectable()
export class UsbDeviceService {

  constructor(private readonly loggerService: LoggerService) {
    usbDetection.startMonitoring();
  }

  /**
   * Handles changed USB device.
   * @param pid Product ID of device.
   * @param vid Vendor ID of device.
   * @param event Event to wait for.
   * @returns Changed USB device.
   */
  on(pid: number, vid: number, event: UsbDeviceChange): Observable<usbDetectionTypes.Device> {
    return new Observable(subscriber => {
      if (event === 'connected') {
        usbDetection.on(`add:${vid}:${pid}`, (device: usbDetectionTypes.Device) => {
          subscriber.next(device);
        });
        usbDetection.find(vid, pid, (error: any, devices: usbDetectionTypes.Device[]) => {
          if (error) {
            this.loggerService.error(`Error with USB detection: ${error}`, this.constructor.name);
          } else {
            devices.forEach((d: usbDetectionTypes.Device) => {
              subscriber.next(d);
            });
          }
        });
      } else {
        usbDetection.on(`remove:${vid}:${pid}`, device => {
          subscriber.next(device);
        });
      }
    });
  }
}
