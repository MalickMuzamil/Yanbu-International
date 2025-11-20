import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTalent } from './admin-talent';

describe('AdminTalent', () => {
  let component: AdminTalent;
  let fixture: ComponentFixture<AdminTalent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTalent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTalent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
