import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollenComponent } from './pollen.component';

describe('PollenComponent', () => {
  let component: PollenComponent;
  let fixture: ComponentFixture<PollenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollenComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
