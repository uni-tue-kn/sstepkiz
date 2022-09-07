import { Test, TestingModule } from '@nestjs/testing';
import { RemotePeerService } from './remote-peer.service';

describe('RemotePeerService', () => {
  let service: RemotePeerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemotePeerService],
    }).compile();

    service = module.get<RemotePeerService>(RemotePeerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
