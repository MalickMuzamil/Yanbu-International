import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailogBox } from './dailog-box';

describe('DailogBox', () => {
  let component: DailogBox;
  let fixture: ComponentFixture<DailogBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailogBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailogBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
