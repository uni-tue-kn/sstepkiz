import { Test, TestingModule } from '@nestjs/testing';
import { LocalPeerService } from './local-peer.service';

describe('LocalPeerService', () => {
  let service: LocalPeerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalPeerService],
    }).compile();

    service = module.get<LocalPeerService>(LocalPeerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
