import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComMessageDialogComponent } from './com-message-dialog.component';

describe('ComMessageDialogComponent', () => {
  let component: ComMessageDialogComponent;
  let fixture: ComponentFixture<ComMessageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComMessageDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
