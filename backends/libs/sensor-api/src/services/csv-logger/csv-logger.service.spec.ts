import { Test, TestingModule } from '@nestjs/testing';
import { CsvLoggerService } from './csv-logger.service';

describe('CsvLoggerService', () => {
  let service: CsvLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvLoggerService],
    }).compile();

    service = module.get<CsvLoggerService>(CsvLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
