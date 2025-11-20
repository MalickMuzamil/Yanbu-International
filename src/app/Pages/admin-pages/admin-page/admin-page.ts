import { Component } from '@angular/core';
import { Sidebar } from '../../../Components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../../Components/pagination/pagination';
import { DailogBox } from '../../../Shared/dailog-box/dailog-box';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { GeneralService } from '../../../Services/general-service';
import { SweetAlert } from '../../../Services/SweetAlert';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-page',
  imports: [Sidebar, CommonModule, Pagination, DailogBox, FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {
  registrations: any[] = [];
  uniqueCities: string[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  showConfirmDialog: boolean = false;
  searchTerm: string = '';
  filteredRegistrations: any[] = [];
  applicationType: string = '';

  constructor(
    private generalService: GeneralService,
    private sweetAlert: SweetAlert
  ) {}

  ngOnInit(): void {
    // this.loadRegistrations(
    //   this.currentPage,
    //   this.pageSize,
    //   this.applicationType
    // );
  }

  loadRegistrations(
    page: number,
    pageSize: number,
    applicationType?: string
  ): void {
    if (!applicationType) {
      this.registrations = [];
      this.filteredRegistrations = [];
      return;
    }

    const payload = {
      page: page,
      pageSize: pageSize,
      applicationType: applicationType,
    };

    this.generalService
      .post('candidateApplication/getApplicationsByType', payload)
      .subscribe({
        next: (res: any) => {
          this.registrations = res?.payload?.items || [];
          this.filteredRegistrations = [...this.registrations];
          this.totalPages = res?.payload?.totalPages || 1;
          if (this.searchTerm) this.applySearchFilter();
        },
        error: (err) => {
          const errorMsg =
            err?.error?.errors?.[0]?.debugMessage ||
            'Failed to load applications';
          this.sweetAlert.error(errorMsg, 'Load Failed');
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRegistrations(page, this.pageSize, this.applicationType);
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applySearchFilter();
  }

  private applySearchFilter(): void {
    const lower = (this.searchTerm || '').toString().toLowerCase().trim();

    if (!lower) {
      this.filteredRegistrations = [...this.registrations];
      return;
    }

    this.filteredRegistrations = this.registrations.filter((r) => {
      if (this.applicationType === 'EASY_APPLY') {
        const candidateId = (r.candidateId ?? '').toString().toLowerCase();
        const candidateName = (r.candidateName ?? '').toString().toLowerCase();
        const jobName = (r.jobName ?? '').toString().toLowerCase();
        const jobTitle = (r.jobTitle ?? '').toString().toLowerCase();
        const email = (r.email ?? '').toString().toLowerCase();
        const status = (r.status ?? '').toString().toLowerCase();

        return (
          candidateId.includes(lower) ||
          candidateName.includes(lower) ||
          jobName.includes(lower) ||
          jobTitle.includes(lower) ||
          email.includes(lower) ||
          status.includes(lower)
        );
      } else if (this.applicationType === 'REGISTERED') {
        const candidateId = (r.candidateId ?? '').toString().toLowerCase();
        const candidateName = (r.candidateName ?? '').toString().toLowerCase();
        const jobTitle = (r.jobTitle ?? '').toString().toLowerCase();
        const email = (r.email ?? '').toString().toLowerCase();
        const status = (r.status ?? '').toString().toLowerCase();

        return (
          candidateId.includes(lower) ||
          candidateName.includes(lower) ||
          jobTitle.includes(lower) ||
          email.includes(lower) ||
          status.includes(lower)
        );
      }
      return false;
    });
  }

  onApplicationTypeChange(type: string): void {
    this.applicationType = type;
    if (this.applicationType) {
      this.currentPage = 1;
      this.loadRegistrations(
        this.currentPage,
        this.pageSize,
        this.applicationType
      );
    } else {
      this.registrations = [];
      this.filteredRegistrations = [];
    }
  }

  exportData(): void {
    const exportData = this.filteredRegistrations.map((r) => ({
      'Candidate ID': r.candidateId ?? '',
      'Candidate Name': r.candidateName ?? '',
      Job: r.jobName ?? r.jobId ?? '',
      'Applied Date': r.appliedAt ? new Date(r.appliedAt).toLocaleString() : '',
      Email: r.email ?? '',
      Status: r.status ?? '',
      Resume: r.resume ?? '',
      'Training Video': r.trainingVideo ?? '',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');

    XLSX.writeFile(wb, 'applications.xlsx');
  }
}
