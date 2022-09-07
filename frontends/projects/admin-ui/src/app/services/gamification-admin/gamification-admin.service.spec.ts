import { TestBed } from '@angular/core/testing';

import { GamificationAdminService } from './gamification-admin.service';

describe('GamificationAdminService', () => {
  let service: GamificationAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamificationAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
