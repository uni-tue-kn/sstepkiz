import { Test, TestingModule } from '@nestjs/testing';
import { UsbDeviceService } from './usb-device.service';

describe('UsbDeviceService', () => {
  let service: UsbDeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsbDeviceService],
    }).compile();

    service = module.get<UsbDeviceService>(UsbDeviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
