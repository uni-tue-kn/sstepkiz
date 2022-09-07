import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NorthAmerikaPlaceDialogComponent } from './north-amerika-place-dialog.component';

describe('NorthAmerikaPlaceDialogComponent', () => {
  let component: NorthAmerikaPlaceDialogComponent;
  let fixture: ComponentFixture<NorthAmerikaPlaceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NorthAmerikaPlaceDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NorthAmerikaPlaceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
