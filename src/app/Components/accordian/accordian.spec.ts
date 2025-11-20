import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accordian } from './accordian';

describe('Accordian', () => {
  let component: Accordian;
  let fixture: ComponentFixture<Accordian>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accordian]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Accordian);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
