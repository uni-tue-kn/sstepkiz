import { Test, TestingModule } from '@nestjs/testing';
import { MovesenseMovDriver } from './movesense-mov.driver';

describe('MovesenseService', () => {
  let service: MovesenseMovDriver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovesenseMovDriver],
    }).compile();

    service = module.get<MovesenseMovDriver>(MovesenseMovDriver);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
