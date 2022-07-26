import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckMetricsComponent } from './deck-metrics.component';

describe('DeckMetricsComponent', () => {
  let component: DeckMetricsComponent;
  let fixture: ComponentFixture<DeckMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeckMetricsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
