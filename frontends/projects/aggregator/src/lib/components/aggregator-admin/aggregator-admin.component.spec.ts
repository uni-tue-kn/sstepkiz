import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregatorAdminComponent } from './aggregator-admin.component';

describe('AggregatorAdminComponent', () => {
  let component: AggregatorAdminComponent;
  let fixture: ComponentFixture<AggregatorAdminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregatorAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregatorAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
