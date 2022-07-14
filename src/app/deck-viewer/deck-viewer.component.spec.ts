import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckViewerComponent } from './deck-viewer.component';

describe('DeckViewerComponent', () => {
  let component: DeckViewerComponent;
  let fixture: ComponentFixture<DeckViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeckViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
