import { TestBed } from '@angular/core/testing';

import { IceApiService } from './ice-api.service';

describe('IceApiService', () => {
  let service: IceApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IceApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
