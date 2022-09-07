import { TestBed } from '@angular/core/testing';

import { ImeraApiService } from './imera-api.service';

describe('ImeraApiService', () => {
  let service: ImeraApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImeraApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
