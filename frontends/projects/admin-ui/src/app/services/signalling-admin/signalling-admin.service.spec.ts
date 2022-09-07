import { TestBed } from '@angular/core/testing';

import { SignallingAdminService } from './signalling-admin.service';

describe('SignallingAdminService', () => {
  let service: SignallingAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignallingAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
