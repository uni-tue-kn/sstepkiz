import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientsOverviewComponent } from './patients-overview.component';

describe('PatientsOverviewComponent', () => {
  let component: PatientsOverviewComponent;
  let fixture: ComponentFixture<PatientsOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientsOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
