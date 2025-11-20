import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SignUp } from '../../Shared/modals/sign-up/sign-up';
import { TranslateModule } from '@ngx-translate/core';
import { GeneralService } from '../../Services/general-service';
import { SweetAlert } from '../../Services/SweetAlert';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-job-view',
  imports: [CommonModule, SignUp, TranslateModule],
  templateUrl: './job-view.html',
  styleUrl: './job-view.css',
})
export class JobView {
  selectedJob: any = null;
  companies: any[] = [];
  filteredCompanies: any[] = [];
  similarJobs: any[] = [];
  isLoading = false;
  selectedCompany: any = null;

  constructor(
    private generalService: GeneralService,
    private sweetAlert: SweetAlert,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const jobIdParam = params.get('id');
      const jobId = jobIdParam ? +jobIdParam : null;

      if (jobId) {
        this.Companies(1, 10, () => this.Jobs(jobId));
      } else {
        this.sweetAlert.error('Invalid Job ID', 'Error');
      }
    });
  }

  // ✅ Get single job by ID
  Jobs(jobId: number) {
    const url = `jobs/getJob/${jobId}`;
    console.log('Final URL:', url);

    this.isLoading = true;

    this.generalService.get(url).subscribe({
      next: (res: any) => {
        this.selectedJob = res?.payload?.items
          ? res.payload.items[0]
          : res?.payload || null;
        this.isLoading = false;

        if (
        this.selectedJob &&
        this.selectedJob.companyId &&
        !this.selectedJob.hideCompanyInfo
      ) {
        this.CompanyById(this.selectedJob.companyId);
      }

        if (this.selectedJob?.jobId) {
          this.getSimilarJobs(this.selectedJob.jobId, 1, 10);
        }
      },
      error: (err) => {
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to load job';
        this.sweetAlert.error(errorMsg, 'Load Failed');
        this.isLoading = false;
      },
    });
  }

  // ✅ Get companies (same as before)
  Companies(page: number, size: number, callback?: () => void) {
    const payload = { page, size };
    this.generalService.post('company/getAllCompanies', payload).subscribe({
      next: (res: any) => {
        this.companies = res?.payload?.items || [];
        this.filteredCompanies = [...this.companies];
        if (callback) callback();
      },
      error: (err) => {
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to load companies';
        this.sweetAlert.error(errorMsg, 'Load Failed');
      },
    });
  }

  CompanyById(companyId: number, callback?: () => void) {
    const url = `company/getCompany/${companyId}`;
    this.generalService.get(url).subscribe({
      next: (res: any) => {
        if (res?.payload) {
         this.selectedCompany = res.payload;
        }
        if (callback) callback();
      },
      error: (err) => {
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to load company';
        this.sweetAlert.error(errorMsg, 'Load Failed');
      },
    });
  }

  // ✅ Copy job URL
  copyJobUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.sweetAlert.success('Job link copied!', 'Copied');
    });
  }

  // ✅ Social share URLs
  getLinkedInShareUrl(): string {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      window.location.href
    )}`;
  }

  getFacebookShareUrl(): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}`;
  }

  getTwitterShareUrl(): string {
    return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      window.location.href
    )}&text=${encodeURIComponent(
      this.selectedJob?.title || 'Check this job!'
    )}`;
  }

  getInstagramShareUrl(): string {
    return `https://www.instagram.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}`;
  }

  // ✅ Apply button action
  applyNow() {
    this.sweetAlert
      .confirmWithOptions(
        'Choose Apply Option',
        'How do you want to apply?',
        'Easy Apply',
        'Create CV via Login'
      )
      .then((result: any) => {
        if (result === 'confirm') {
          const modal = document.getElementById('signUpModal');
          if (modal) {
            (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
          }
        } else if (result === 'cancel') {
          if (this.selectedJob?.jobId) {
            localStorage.setItem('jobId', this.selectedJob.jobId.toString());
          }
          this.router.navigate(['/login']);
        }
      });
  }

  // ✅ Get similar jobs
  getSimilarJobs(jobId: number, page = 1, size = 10) {
    this.isLoading = true;

    const payload = { page, size };

    this.generalService
      .post(`jobs/getSimilarJobs/${jobId}`, payload)
      .subscribe({
        next: (res: any) => {
          this.similarJobs = res?.payload?.items || [];
          this.isLoading = false;
        },
        error: (err) => {
          const errorMsg =
            err?.error?.errors?.[0]?.debugMessage ||
            'Failed to load similar jobs';
          this.sweetAlert.error(errorMsg, 'Load Failed');
          this.isLoading = false;
        },
      });
  }
}
