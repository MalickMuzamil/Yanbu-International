import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../Components/sidebar/sidebar';
import { Pagination } from '../../../Components/pagination/pagination';
import { FormsModule } from '@angular/forms';
import { GeneralService } from '../../../Services/general-service';
import { SweetAlert } from '../../../Services/SweetAlert';
import { CompanyModal } from '../../../Shared/modals/company-modal/company-modal';

@Component({
  selector: 'app-admin-company',
  imports: [CommonModule, Sidebar, Pagination, FormsModule, CompanyModal],
  templateUrl: './admin-company.html',
  styleUrl: './admin-company.css'
})
export class AdminCompany {
  companies: any[] = [];
  filteredCompanies: any[] = [];
  searchTerm: string = '';
  currentPage = 1;
  totalPages = 1;

  @ViewChild(CompanyModal) companyModal!: CompanyModal;


  constructor(private generalService: GeneralService, private sweetAlert: SweetAlert) { }

  ngOnInit(): void {
    this.Companies(1, 10);
  }

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
        const errorMsg = err?.error?.errors?.[0]?.debugMessage || 'Failed to load companies';
        this.sweetAlert.error(errorMsg, 'Load Failed');
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.Companies(page, 10);
  }

  onSearchChange() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredCompanies = [...this.companies];
      return;
    }

    this.filteredCompanies = this.companies.filter(
      (company) =>
        company.name.toLowerCase().includes(term) ||
        company.industry.toLowerCase().includes(term) ||
        company.location.toLowerCase().includes(term)
    );
  }

  openCreateModal() {
    this.companyModal.mode = 'create';
    this.companyModal.openModal();
  }

  openEditModal(company: any) {
    this.companyModal.mode = 'edit';
    this.companyModal.openModal(company);
  }

  onModalClosed() {
    this.Companies(this.currentPage, 10);
  }

  openViewModal(company: any) {
    this.companyModal.mode = 'view';
    this.companyModal.openModal(company);
  }

  deleteCompany(company: any) {
    this.sweetAlert.confirm(
      `Are you sure you want to delete ${company.companyName}?`,
      'This action cannot be undone.'
    ).then((confirmed: boolean) => {
      if (!confirmed) return;

      const companyId = company.companyId;
      const url = `company/deleteCompany/${companyId}`;

      this.generalService.delete(url, {}).subscribe({
        next: () => {
          this.sweetAlert.success('Company deleted successfully!', 'Success');
          this.Companies(this.currentPage, 10);
        },
        error: (err) => {
          const errorMsg = err?.error?.errors?.[0]?.debugMessage || 'Failed to delete company';
          this.sweetAlert.error(errorMsg, 'Error');
          console.error(err);
        }
      });
    });
  }

}
