import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyOverviewComponent } from './study-overview.component';

describe('StudyOverviewComponent', () => {
  let component: StudyOverviewComponent;
  let fixture: ComponentFixture<StudyOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
