import { Component, ViewChild } from '@angular/core';
import { Sidebar } from '../../../Components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../../Components/pagination/pagination';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { JobModal } from '../../../Shared/modals/job-modal/job-modal';
import { GeneralService } from '../../../Services/general-service';
import { Accordian } from '../../../Components/accordian/accordian';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-jobs',
  imports: [
    Sidebar,
    CommonModule,
    Pagination,
    FormsModule,
    JobModal,
    Accordian,
  ],
  templateUrl: './admin-jobs.html',
  styleUrl: './admin-jobs.css',
})
export class AdminJobs {
  jobs: any[] = [];
  filteredJobs: any[] = [];
  accordionItems: any[] = [];
  latestJob: any = null;
  currentPage = 1;
  totalPages = 1;
  selectedJob: any = null;
  searchTerm: string = '';
  showDeleteModal: boolean = false;
  selectedFilters: any = {};

  @ViewChild('jobModal') jobModal!: JobModal;

  constructor(private generalService: GeneralService) {}

  ngOnInit(): void {
    this.Jobs(1, 10);
  }

  Jobs(page: number, size: number) {
    const payload = { page, size };

    this.generalService.post('jobs/getAllJobs', payload).subscribe({
      next: (res: any) => {
        console.log('Jobs loaded:', res);

        this.jobs = res?.payload?.items || [];
        this.filteredJobs = [...this.jobs];
        this.totalPages = res?.payload?.totalPages || 1;
        this.currentPage = res?.payload?.currentPage || page;

        this.buildAccordionItems();
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to load jobs';
        Swal.fire('Error', errorMsg, 'error');
      },
    });
  }

  buildAccordionItems() {
    const locations = Array.from(
      new Set(this.jobs.map((j) => j.location))
    ).slice(0, 5);
    const experiences = Array.from(
      new Set(this.jobs.map((j) => j.experience))
    ).slice(0, 5);
    const salaries = Array.from(new Set(this.jobs.map((j) => j.salary))).slice(
      0,
      5
    );
    const genders = Array.from(new Set(this.jobs.map((j) => j.gender))).slice(
      0,
      5
    );

    this.accordionItems = [
      { title: 'Location', content: locations },
      { title: 'Salary', content: salaries },
      { title: 'Experience', content: experiences },
      { title: 'Gender', content: genders },
    ];
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.Jobs(page, 10);
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChanged(filterData: any) {
    const { type, event } = filterData;
    const value = event.target.value;
    const checked = event.target.checked;

    if (!this.selectedFilters[type]) {
      this.selectedFilters[type] = [];
    }

    if (checked) {
      if (!this.selectedFilters[type].includes(value)) {
        this.selectedFilters[type].push(value);
      }
    } else {
      this.selectedFilters[type] = this.selectedFilters[type].filter(
        (v: any) => v !== value
      );
    }

    this.applyFilters();
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredJobs = this.jobs.filter((job) => {
      const matchesSearch =
        !term ||
        job.title?.toLowerCase().includes(term) ||
        job.description?.toLowerCase().includes(term) ||
        job.companyName?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term);

      let matchesFilters = true;
      for (const key in this.selectedFilters) {
        const selectedValues = this.selectedFilters[key];
        if (selectedValues && selectedValues.length > 0) {
          let jobValue: any = '';
          if (key === 'Location') jobValue = job.location;
          if (key === 'Experience') jobValue = job.experience;
          if (key === 'Salary') jobValue = job.salary;
          if (key === 'Gender') jobValue = job.gender;

          if (!selectedValues.includes(jobValue)) {
            matchesFilters = false;
            break;
          }
        }
      }

      return matchesSearch && matchesFilters;
    });
  }

  openCreateJobModal() {
    this.jobModal.openModal();
    this.jobModal.jobData = null;
  }

  openEditModal(company: any) {
    this.jobModal.openModal(company);
  }

  onModalClosed() {
    this.Jobs(this.currentPage, 10);
  }

  deleteJob(job: any) {
    console.log('Delete clicked for job id:', job.jobId);

    Swal.fire({
      title: 'Delete Confirmation',
      text: 'Are you sure you want to delete this job?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.generalService
          .delete(`jobs/deleteJob/${job.jobId}`, {})
          .subscribe({
            next: () => {
              this.jobs = this.jobs.filter((j) => j.id !== job.jobId);
              this.filteredJobs = this.filteredJobs.filter(
                (j) => j.id !== job.jobId
              );
              Swal.fire('Deleted!', 'Job has been deleted.', 'success');
              this.Jobs(1, 10);
            },
            error: (err) => {
              console.error('Error deleting job:', err);
              Swal.fire('Error!', 'Failed to delete job.', 'error');
            },
          });
      }
    });
  }
}
