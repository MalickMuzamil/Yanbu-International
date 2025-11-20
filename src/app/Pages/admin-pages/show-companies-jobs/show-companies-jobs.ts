import { Component } from '@angular/core';
import { Sidebar } from '../../../Components/sidebar/sidebar';
import { Pagination } from '../../../Components/pagination/pagination';
import { GeneralService } from '../../../Services/general-service';
import { SweetAlert } from '../../../Services/SweetAlert';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-companies-jobs',
  imports: [Sidebar, Pagination, FormsModule, CommonModule],
  templateUrl: './show-companies-jobs.html',
  styleUrl: './show-companies-jobs.css',
})
export class ShowCompaniesJobs {
  searchTerm: string = '';
  currentPage = 1;
  totalPages = 1;
  jobs: any[] = [];
  filteredJobs: any[] = [];
  companyId: number = 0;
  companyName: string = '';

  constructor(
    private generalService: GeneralService,
    private sweetAlert: SweetAlert
  ) {}

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('companyId');
    const name = urlParams.get('companyName');

    if (id) {
      this.companyId = +id;
      this.companyName = name || '';
      this.fetchJobs();
    } else {
      this.sweetAlert.error('No company selected!', 'Error');
    }
  }

  fetchJobs(page: number = 1) {
    this.currentPage = page;

    const payload = {
      companyName: this.companyName,
      page: this.currentPage,
      size: 10,
    };

    this.generalService
      .post(`jobs/getJobByCompany/${this.companyId}`, payload)
      .subscribe({
        next: (res: any) => {
          this.jobs = res.payload?.items || [];
          this.totalPages = res.payload?.totalPages || 1;

          this.filteredJobs = [...this.jobs];
        },
        error: (err) => {
          const errorMsg =
            err?.error?.errors?.[0]?.debugMessage || 'Failed to fetch jobs';
          this.sweetAlert.error(errorMsg, 'Error');
        },
      });
  }

  onPageChange(newPage: number) {
    this.fetchJobs(newPage);
  }

  onSearchChange() {
  const term = this.searchTerm.trim().toLowerCase();

  if (!term) {
    this.filteredJobs = [...this.jobs];
    return;
  }

  this.filteredJobs = this.jobs.filter((job) => {
    // Safely convert everything to string first
    const title = (job.title || '').toString().toLowerCase();
    const location = (job.location || '').toString().toLowerCase();
    const salary = (job.salary || '').toString().toLowerCase();
    const experience = (job.experience || '').toString().toLowerCase();
    const description = (job.description || '').toString().toLowerCase();

    // Format date in yyyy-MM-dd to compare
    const postedDate = job.jobPostedDate
      ? new Date(job.jobPostedDate).toISOString().slice(0, 10).toLowerCase()
      : '';

    return (
      title.includes(term) ||
      location.includes(term) ||
      salary.includes(term) ||
      postedDate.includes(term) ||
      experience.includes(term) ||
      description.includes(term)
    );
  });
}

}
