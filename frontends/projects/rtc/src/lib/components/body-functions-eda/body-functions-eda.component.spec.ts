import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyFunctionsEdaComponent } from './body-functions-eda.component';

describe('BodyFunctionsEdaComponent', () => {
  let component: BodyFunctionsEdaComponent;
  let fixture: ComponentFixture<BodyFunctionsEdaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyFunctionsEdaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyFunctionsEdaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
