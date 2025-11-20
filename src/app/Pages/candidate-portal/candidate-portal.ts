import { Component } from '@angular/core';
import { CandidateSidebar } from '../../Components/candidate-sidebar/candidate-sidebar';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../Components/pagination/pagination';
import { DailogBox } from '../../Shared/dailog-box/dailog-box';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { GeneralService } from '../../Services/general-service';
import { SweetAlert } from '../../Services/SweetAlert';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-candidate-portal',
  imports: [
    CandidateSidebar,
    Pagination,
    CommonModule,
    DailogBox,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './candidate-portal.html',
  styleUrl: './candidate-portal.css',
})
export class CandidatePortal {
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  showConfirmDialog: boolean = false;
  appliedJobs: any[] = [];
  isCollapsed = false;

  constructor(
    private generalService: GeneralService,
    private sweetAlert: SweetAlert
  ) {}

  ngOnInit(): void {
    this.getAppliedJobs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getAppliedJobs();
  }

  getAppliedJobs(): void {
    const body = {
      page: this.currentPage,
      size: this.pageSize,
    };

    this.generalService
    //Yaha User ID bhjni ha !! 
      .post('candidateApplication/getAppliedJobs/YI-SA-002', body)
      .subscribe({
        next: (res: any) => {
          console.log(res);

          this.appliedJobs = res?.payload?.items || [];
          this.totalPages = res?.payload?.totalPages || 1;
          this.currentPage = res?.payload?.currentPage || this.currentPage;
        },
        error: (err) => {
          console.error(err);
          this.sweetAlert.error('Jobs fetch karne mein error aaya');
        },
      });
  }
}
