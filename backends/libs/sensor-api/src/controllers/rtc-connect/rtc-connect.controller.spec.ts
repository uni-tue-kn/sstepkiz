import { Test, TestingModule } from '@nestjs/testing';
import { RtcConnectController } from './rtc-connect.controller';

describe('RtcConnect Controller', () => {
  let controller: RtcConnectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RtcConnectController],
    }).compile();

    controller = module.get<RtcConnectController>(RtcConnectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
