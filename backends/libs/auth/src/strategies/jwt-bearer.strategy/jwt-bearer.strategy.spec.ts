import { Test, TestingModule } from '@nestjs/testing';

import { JwtBearerStrategy } from './jwt-bearer.strategy';

describe('JwtBearerStrategy', () => {
  let service: JwtBearerStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtBearerStrategy],
    }).compile();

    service = module.get<JwtBearerStrategy>(JwtBearerStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
