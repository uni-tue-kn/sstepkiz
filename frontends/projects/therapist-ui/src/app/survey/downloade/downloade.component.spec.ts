import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadeComponent } from './downloade.component';

describe('DownloadeComponent', () => {
  let component: DownloadeComponent;
  let fixture: ComponentFixture<DownloadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
