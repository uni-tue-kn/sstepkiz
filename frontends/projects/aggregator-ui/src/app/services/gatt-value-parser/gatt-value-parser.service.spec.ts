import { TestBed } from '@angular/core/testing';

import { GattValueParserService } from './gatt-value-parser.service';

describe('GattValueParserService', () => {
  let service: GattValueParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GattValueParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
