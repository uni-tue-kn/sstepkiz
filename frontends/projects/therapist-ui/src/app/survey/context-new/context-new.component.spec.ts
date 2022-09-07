import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextNewComponent } from './context-new.component';

describe('ContextNewComponent', () => {
  let component: ContextNewComponent;
  let fixture: ComponentFixture<ContextNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
