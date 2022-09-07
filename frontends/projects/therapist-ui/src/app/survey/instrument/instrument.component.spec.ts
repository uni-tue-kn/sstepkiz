import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstrumentComponent } from './instrument.component';

describe('InstrumentComponent', () => {
  let component: InstrumentComponent;
  let fixture: ComponentFixture<InstrumentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InstrumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
