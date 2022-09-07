import { Test, TestingModule } from '@nestjs/testing';
import { RtcSenderService } from './rtc-sender.service';

describe('RtcSenderService', () => {
  let service: RtcSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RtcSenderService],
    }).compile();

    service = module.get<RtcSenderService>(RtcSenderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
