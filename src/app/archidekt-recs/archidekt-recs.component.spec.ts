import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchidektRecsComponent } from './archidekt-recs.component';

describe('ArchidektRecsComponent', () => {
  let component: ArchidektRecsComponent;
  let fixture: ComponentFixture<ArchidektRecsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchidektRecsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchidektRecsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
