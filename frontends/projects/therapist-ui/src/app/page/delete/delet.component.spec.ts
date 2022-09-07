import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletComponent } from './delet.component';

describe('DeletComponent', () => {
  let component: DeletComponent;
  let fixture: ComponentFixture<DeletComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
