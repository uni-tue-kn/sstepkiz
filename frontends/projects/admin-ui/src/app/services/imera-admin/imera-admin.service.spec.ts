import { TestBed } from '@angular/core/testing';

import { ImeraAdminService } from './imera-admin.service';

describe('ImeraAdminService', () => {
  let service: ImeraAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImeraAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
