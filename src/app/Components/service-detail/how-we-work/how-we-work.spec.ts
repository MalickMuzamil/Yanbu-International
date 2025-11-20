import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowWeWork } from './how-we-work';

describe('HowWeWork', () => {
  let component: HowWeWork;
  let fixture: ComponentFixture<HowWeWork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowWeWork]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HowWeWork);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
