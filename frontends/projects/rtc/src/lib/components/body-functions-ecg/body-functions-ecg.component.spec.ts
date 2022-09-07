import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyFunctionsEcgComponent } from './body-functions-ecg.component';

describe('BodyFunctionsEcgComponent', () => {
  let component: BodyFunctionsEcgComponent;
  let fixture: ComponentFixture<BodyFunctionsEcgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyFunctionsEcgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyFunctionsEcgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
