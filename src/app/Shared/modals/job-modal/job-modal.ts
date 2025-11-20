import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { GeneralService } from '../../../Services/general-service';
import { SweetAlert } from '../../../Services/SweetAlert';

declare var bootstrap: any;

@Component({
  selector: 'app-job-modal',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './job-modal.html',
  styleUrls: ['./job-modal.css'],
})
export class JobModal {
  @Input() jobData?: any;
  @Output() closed = new EventEmitter<void>();

  jobForm!: FormGroup;
  companies: any[] = [];
  filteredCompanies: any[] = [];
  currentPage = 1;
  totalPages = 1;
  hideCompanyInfo: boolean = false;

  constructor(
    private fb: FormBuilder,
    private generalService: GeneralService,
    private sweetAlert: SweetAlert
  ) {}

  ngOnInit(): void {
    this.jobForm = this.fb.group({
      jobTitle: [this.jobData?.jobTitle || '', Validators.required],
      companyId: [this.jobData?.companyId || '', Validators.required],
      jobLocation: [this.jobData?.jobLocation || '', Validators.required],
      jobType: [this.jobData?.jobType || '', Validators.required],
      jobDescription: [this.jobData?.jobDescription || '', Validators.required],
      jobSkills: [this.jobData?.jobSkills || ''],
      jobSalary: [this.jobData?.jobSalary || '', Validators.required],
      jobCurrency: [this.jobData?.jobCurrency || '', Validators.required],
      experience: ['', Validators.required],
      gender: ['', Validators.required],
      vacancy: [1, [Validators.required, Validators.min(1)]],
      jobPostedDate: ['', Validators.required],
      rolesAndResponsibility: ['', Validators.required],
      hideCompanyInfo: [false],
      education: ['', Validators.required],
      nationality: ['', Validators.required],
    });

    this.Companies(1, 10);
  }

  currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'INR', symbol: '₹' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'AED', symbol: 'د.إ' },
  ];

  Companies(page: number, size: number) {
    const payload = { page, size };

    this.generalService.post('company/getAllCompanies', payload).subscribe({
      next: (res: any) => {
        console.log('Companies loaded:', res);

        this.companies = res?.payload?.items || [];
        this.filteredCompanies = [...this.companies];

        this.totalPages = res?.payload?.totalPages || 1;
        this.currentPage = res?.payload?.currentPage || page;
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to load companies';
        this.sweetAlert.error(errorMsg, 'Load Failed');
      },
    });
  }

  openModal(data?: any) {
    this.jobData = data || null;

    if (this.jobData) {
      const salary = this.jobData.salary || '';
      const symbolMatch = salary.match(/[^0-9\-\s]+$/); // matches non-numeric at end
      const symbol = symbolMatch ? symbolMatch[0] : '';
      const salaryOnly = symbol ? salary.replace(symbol, '').trim() : salary;

      this.jobForm.patchValue({
        jobTitle: this.jobData.title,
        companyId: this.jobData.companyId,
        jobLocation: this.jobData.location,
        jobType: this.jobData.jobType || '',
        jobDescription: this.jobData.description,
        jobSkills: this.jobData.skills?.join(', ') || '',
        jobSalary: salaryOnly,
        jobCurrency: symbol,
        experience: this.jobData.experience,
        gender: this.jobData.gender,
        vacancy: this.jobData.vacancy,
        jobPostedDate: this.jobData.jobPostedDate?.slice(0, 10),
        rolesAndResponsibility: this.jobData.rolesAndResponsibility,
        hideCompanyInfo: this.jobData.hideCompanyInfo ?? false,
        education: this.jobData.education || '',
        nationality: this.jobData.nationality || '',
      });
    } else {
      this.jobForm.reset();
      this.jobForm.get('hideCompanyInfo')?.setValue(false);
    }

    const modalEl = document.getElementById('jobModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  closeModal() {
    const modalEl = document.getElementById('jobModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
    this.closed.emit();
  }

  onToggleCompanyInfo(value: boolean): void {
    console.log('Hide company info:', value ? 'Yes' : 'No');
  }

  submitForm() {
    if (!this.jobForm.valid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    const formValue = this.jobForm.value;

    const combinedSalary =
      formValue.jobSalary && formValue.jobCurrency
        ? `${formValue.jobSalary}${formValue.jobCurrency}`
        : formValue.jobSalary;

    const jobData = {
      title: formValue.jobTitle,
      companyId: Number(formValue.companyId),
      description: formValue.jobDescription,
      location: formValue.jobLocation,
      salary: combinedSalary,
      experience: formValue.experience,
      gender: formValue.gender,
      vacancy: formValue.vacancy,
      jobPostedDate: new Date(formValue.jobPostedDate).toISOString(),
      rolesAndResponsibility: formValue.rolesAndResponsibility,
      createdBy: JSON.parse(localStorage.getItem('adminData') || '{}').id || 0,
      status: true,
      hideCompanyInfo: formValue.hideCompanyInfo,
      skills: formValue.jobSkills
        ? formValue.jobSkills.split(',').map((s: string) => s.trim())
        : [],
      education: formValue.education,
      nationality: formValue.nationality,
    };

    let url = 'jobs/createJob';
    let request$;

    if (this.jobData?.jobId) {
      url = `jobs/updateJob/${this.jobData.jobId}`;
      request$ = this.generalService.patch(url, jobData);
    } else {
      request$ = this.generalService.post(url, jobData);
    }

    console.log('Mapped Job payload:', jobData);

    request$.subscribe({
      next: () => {
        this.sweetAlert.success(
          this.jobData?.jobId ? 'Job updated!' : 'Job created!',
          'Success'
        );
        this.closeModal();
        this.jobForm.reset();
      },
      error: (err) => {
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to save job';
        this.sweetAlert.error(errorMsg, 'Error');
        console.error(err);
      },
    });
  }

  get f() {
    return this.jobForm.controls;
  }
}
