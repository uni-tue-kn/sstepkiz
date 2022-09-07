import { Test, TestingModule } from '@nestjs/testing';
import { UdpConnectorService } from './udp-connector.service';

describe('UdpConnectorService', () => {
  let service: UdpConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UdpConnectorService],
    }).compile();

    service = module.get<UdpConnectorService>(UdpConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
