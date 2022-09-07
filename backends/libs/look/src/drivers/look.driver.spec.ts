import { Test, TestingModule } from '@nestjs/testing';
import { LookService } from './look.driver';

describe('LookService', () => {
  let service: LookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LookService],
    }).compile();

    service = module.get<LookService>(LookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
