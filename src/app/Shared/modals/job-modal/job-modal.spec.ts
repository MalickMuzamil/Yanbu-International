import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobModal } from './job-modal';

describe('JobModal', () => {
  let component: JobModal;
  let fixture: ComponentFixture<JobModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
