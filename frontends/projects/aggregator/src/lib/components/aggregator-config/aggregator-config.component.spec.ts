import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregatorConfigComponent } from './aggregator-config.component';

describe('AggregatorConfigComponent', () => {
  let component: AggregatorConfigComponent;
  let fixture: ComponentFixture<AggregatorConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregatorConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregatorConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
