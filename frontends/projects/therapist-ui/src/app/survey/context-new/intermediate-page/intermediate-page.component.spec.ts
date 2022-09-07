import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntermediatePageComponent } from './intermediate-page.component';

describe('IntermediatePageComponent', () => {
  let component: IntermediatePageComponent;
  let fixture: ComponentFixture<IntermediatePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntermediatePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntermediatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
