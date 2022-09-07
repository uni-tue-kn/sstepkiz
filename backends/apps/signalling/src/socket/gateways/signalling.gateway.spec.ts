import { Test, TestingModule } from '@nestjs/testing';
import { SignallingGateway } from './signalling.gateway';

describe('SignallingGateway', () => {
  let gateway: SignallingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignallingGateway],
    }).compile();

    gateway = module.get<SignallingGateway>(SignallingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
