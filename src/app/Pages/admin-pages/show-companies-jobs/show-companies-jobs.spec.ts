import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCompaniesJobs } from './show-companies-jobs';

describe('ShowCompaniesJobs', () => {
  let component: ShowCompaniesJobs;
  let fixture: ComponentFixture<ShowCompaniesJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCompaniesJobs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowCompaniesJobs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
