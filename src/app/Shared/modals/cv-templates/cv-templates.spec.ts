import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvTemplates } from './cv-templates';

describe('CvTemplates', () => {
  let component: CvTemplates;
  let fixture: ComponentFixture<CvTemplates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvTemplates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvTemplates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
