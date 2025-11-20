import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../Components/sidebar/sidebar';
import { Pagination } from '../../../Components/pagination/pagination';
import { FormsModule } from '@angular/forms';
import { GeneralService } from '../../../Services/general-service';
import { SweetAlert } from '../../../Services/SweetAlert';

@Component({
  selector: 'app-admin-talent',
  imports: [CommonModule, Sidebar, Pagination, FormsModule],
  templateUrl: './admin-talent.html',
  styleUrl: './admin-talent.css',
})
export class AdminTalent implements OnInit {
  companies: any[] = [];
  filteredCompanies: any[] = [];
  searchTerm: string = '';
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  isLoading = false;

  constructor(private general: GeneralService, private swal: SweetAlert) {}

  ngOnInit() {
    this.getAllTalent(this.currentPage, this.pageSize);
  }

  getAllTalent(page: number, size: number) {
    this.isLoading = true;
    const payload = { page, size };

    this.general.post('hiretalent/getAll', payload).subscribe({
      next: (res: any) => {
        this.companies = res?.payload?.items || [];
        this.filteredCompanies = [...this.companies];
        this.totalPages = res?.payload?.totalPages || 1;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to load data';
        this.swal.error(errorMsg, 'Load Failed');
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllTalent(this.currentPage, this.pageSize);
  }

  onSearchChange() {
  const term = this.searchTerm.trim().toLowerCase();

  if (!term) {
    this.filteredCompanies = [...this.companies];
    return;
  }

  this.filteredCompanies = this.companies.filter(
    (company) =>
      company.companyName?.toLowerCase().includes(term) ||
      company.contactName?.toLowerCase().includes(term) ||
      company.email?.toLowerCase().includes(term) ||
      company.phone?.toLowerCase().includes(term) ||
      company.jobDescription?.toLowerCase().includes(term) ||
      company.location?.toLowerCase().includes(term) ||
      company.roleTitle?.toLowerCase().includes(term) ||
      company.salaryRange?.toLowerCase().includes(term) ||
      company.urgency?.toLowerCase().includes(term)
  );
}

}
