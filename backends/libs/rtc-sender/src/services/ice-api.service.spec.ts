import { Test, TestingModule } from '@nestjs/testing';
import { IceApiService } from './ice-api.service';

describe('IceApiService', () => {
  let service: IceApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IceApiService],
    }).compile();

    service = module.get<IceApiService>(IceApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
