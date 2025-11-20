import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatePortal } from './candidate-portal';

describe('CandidatePortal', () => {
  let component: CandidatePortal;
  let fixture: ComponentFixture<CandidatePortal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatePortal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatePortal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
