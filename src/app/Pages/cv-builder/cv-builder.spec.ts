import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CVBuilder } from './cv-builder';

describe('CVBuilder', () => {
  let component: CVBuilder;
  let fixture: ComponentFixture<CVBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CVBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CVBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
