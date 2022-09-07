import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWardrobeMenuComponent } from './game-wardrobe-menu.component';

describe('GameWardrobeMenuComponent', () => {
  let component: GameWardrobeMenuComponent;
  let fixture: ComponentFixture<GameWardrobeMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameWardrobeMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameWardrobeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
