import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWardorbeComponent } from './game-wardorbe.component';

describe('GameWardorbeComponent', () => {
  let component: GameWardorbeComponent;
  let fixture: ComponentFixture<GameWardorbeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameWardorbeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameWardorbeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
