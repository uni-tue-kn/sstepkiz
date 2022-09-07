import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEtapeComponent } from './new-etape.component';

describe('NewEtapeComponent', () => {
  let component: NewEtapeComponent;
  let fixture: ComponentFixture<NewEtapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewEtapeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewEtapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
