import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextOverviewComponent } from './context-overview.component';

describe('ContextOverviewComponent', () => {
  let component: ContextOverviewComponent;
  let fixture: ComponentFixture<ContextOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
