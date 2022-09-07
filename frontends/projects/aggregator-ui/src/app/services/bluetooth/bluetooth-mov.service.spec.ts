import { TestBed } from '@angular/core/testing';

import { BluetoothMovService } from './bluetooth-mov.service';

describe('BluetoothMovService', () => {
  let service: BluetoothMovService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BluetoothMovService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
