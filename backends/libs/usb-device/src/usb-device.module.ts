import { Global, Module } from '@nestjs/common';
import { UsbDeviceService } from './usb-device.service';

@Global()
@Module({
  providers: [UsbDeviceService],
  exports: [UsbDeviceService],
})
export class UsbDeviceModule {}
