import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EyetrackingComponent } from './eyetracking.component';

describe('EyetrackingComponent', () => {
  let component: EyetrackingComponent;
  let fixture: ComponentFixture<EyetrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EyetrackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EyetrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
