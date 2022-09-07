import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringDashboardComponent } from './monitoring-dashboard.component';

describe('MonitoringDashboardComponent', () => {
  let component: MonitoringDashboardComponent;
  let fixture: ComponentFixture<MonitoringDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoringDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
