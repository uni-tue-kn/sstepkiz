import { TestBed } from '@angular/core/testing';

import { HrvFrequencyDomainService } from './hrv-frequency-domain.service';

describe('HrvFrequencyDomainService', () => {
  let service: HrvFrequencyDomainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrvFrequencyDomainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
