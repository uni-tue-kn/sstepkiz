import { Test, TestingModule } from '@nestjs/testing';

import { JwtQueryStrategy } from './jwt-query.strategy';

describe('JwtQueryStrategy', () => {
  let service: JwtQueryStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtQueryStrategy],
    }).compile();

    service = module.get<JwtQueryStrategy>(JwtQueryStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
