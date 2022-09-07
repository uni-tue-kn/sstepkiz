import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyContextScheduleComponent } from './weekly-context-schedule.component';

describe('WeeklyContextScheduleComponent', () => {
  let component: WeeklyContextScheduleComponent;
  let fixture: ComponentFixture<WeeklyContextScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeeklyContextScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyContextScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
