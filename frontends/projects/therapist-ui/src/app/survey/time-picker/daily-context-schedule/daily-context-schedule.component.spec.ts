import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyContextScheduleComponent } from './daily-context-schedule.component';

describe('DailyContextScheduleComponent', () => {
  let component: DailyContextScheduleComponent;
  let fixture: ComponentFixture<DailyContextScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyContextScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyContextScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
