import { Test, TestingModule } from '@nestjs/testing';
import { MovesenseEcgDriver } from './movesense.driver';

describe('MovesenseService', () => {
  let service: MovesenseEcgDriver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovesenseEcgDriver],
    }).compile();

    service = module.get<MovesenseEcgDriver>(MovesenseEcgDriver);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
