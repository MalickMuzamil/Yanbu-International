import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { GeneralService } from '../../../Services/general-service';
import { SweetAlert } from '../../../Services/SweetAlert';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-company-modal',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './company-modal.html',
  styleUrls: ['./company-modal.css'],
})
export class CompanyModal {
  @Input() companyData?: any;
  @Input() mode: 'view' | 'edit' | 'create' = 'view';
  @Output() closed = new EventEmitter<void>();

  companyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private generalService: GeneralService,
    private sweetAlert: SweetAlert,
    private router: Router
  ) {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyWebsiteUrl: [''],
      companyLocation: ['', Validators.required],
      companyAddress: [''],
      companyType: ['', Validators.required],
      companyPhoneNumber: [''],
      companyIndustry: ['', Validators.required],
      companyDescription: [''],
      companyLogoUrl: [null],
      employeeCount: ['', Validators.required],
    });
  }

  get isReadOnly() {
    return this.mode === 'view';
  }

  openModal(data?: any) {
    this.companyData = data;

    if (this.mode === 'edit' && data) {
      this.companyForm.patchValue(data);
    } else if (this.mode === 'create') {
      this.companyForm.reset();
    }

    const modalEl = document.getElementById('companyModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  closeModal() {
    const modalEl = document.getElementById('companyModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
    this.closed.emit();
  }

  submitForm() {
    if (!this.companyForm.valid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const companyData = { ...this.companyForm.value };
    const user = JSON.parse(localStorage.getItem('adminData') || '{}');
    const createdBy = user?.id || 0;

    const finalData = { ...companyData, createdBy };

    const logoFile = finalData.companyLogoUrl;

    if (logoFile instanceof File) {
      const formData = new FormData();
      formData.append('logo', logoFile);

      this.generalService.post('company/uploadLogo', formData).subscribe({
        next: (res: any) => {
          finalData.companyLogoUrl = res.payload.logoUrl;
          this.createOrUpdateCompany(finalData);
        },
        error: () => {
          this.sweetAlert.error('Logo upload failed', 'Error');
        },
      });
    } else {
      this.createOrUpdateCompany(finalData);
    }
  }

  createOrUpdateCompany(finalData: any) {
    const url = this.companyData?.companyId
      ? `company/updateCompany/${this.companyData.companyId}`
      : 'company/createCompany';

    this.generalService.post(url, finalData).subscribe({
      next: () => {
        this.sweetAlert.success(
          this.companyData?.companyId ? 'Company updated!' : 'Company created!',
          'Success'
        );
        this.closeModal();
        this.companyForm.reset();
      },
      error: (err) => {
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to save company';
        this.sweetAlert.error(errorMsg, 'Error');
      },
    });
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.companyForm.patchValue({ companyLogoUrl: file });
    }
  }

  get f() {
    return this.companyForm.controls;
  }

  showAllJobsAgainstSingleCompany() {
    if (!this.companyData) return;

    const companyId = this.companyData.companyId;
    const companyName = this.companyData.companyName;

    console.log('Navigating to jobs with:', { companyId, companyName });

    this.router.navigate(['/show-companies-jobs'], {
      queryParams: { companyId, companyName },
    });
  }
}
