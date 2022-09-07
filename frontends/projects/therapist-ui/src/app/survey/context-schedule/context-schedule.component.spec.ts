import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextScheduleComponent } from './context-schedule.component';

describe('ContextScheduleComponent', () => {
  let component: ContextScheduleComponent;
  let fixture: ComponentFixture<ContextScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContextScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
