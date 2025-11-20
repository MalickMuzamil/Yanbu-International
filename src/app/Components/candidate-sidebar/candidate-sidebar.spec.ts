import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateSidebar } from './candidate-sidebar';

describe('CandidateSidebar', () => {
  let component: CandidateSidebar;
  let fixture: ComponentFixture<CandidateSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
