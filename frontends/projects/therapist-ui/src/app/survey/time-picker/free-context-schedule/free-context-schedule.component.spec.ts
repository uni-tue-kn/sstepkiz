import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeContextScheduleComponent } from './free-context-schedule.component';

describe('FreeContextScheduleComponent', () => {
  let component: FreeContextScheduleComponent;
  let fixture: ComponentFixture<FreeContextScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreeContextScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreeContextScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
