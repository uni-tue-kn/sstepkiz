import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFrameComponent } from './survey-frame.component';

describe('SurveyFrameComponent', () => {
  let component: SurveyFrameComponent;
  let fixture: ComponentFixture<SurveyFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyFrameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
