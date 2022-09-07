import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineIndicatorComponent } from './offline-indicator.component';

describe('OfflineIndicatorComponent', () => {
  let component: OfflineIndicatorComponent;
  let fixture: ComponentFixture<OfflineIndicatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
