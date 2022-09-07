import { TestBed } from '@angular/core/testing';

import { RtcDataService } from './rtc-data.service';

describe('RtcDataService', () => {
  let service: RtcDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RtcDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
