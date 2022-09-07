import { TestBed } from '@angular/core/testing';

import { HrvTimeDomainService } from './hrv-time-domain.service';

describe('HrvTimeDomainService', () => {
  let service: HrvTimeDomainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrvTimeDomainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
