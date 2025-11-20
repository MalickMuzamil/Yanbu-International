import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Accordian } from '../../Components/accordian/accordian';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { GeneralService } from '../../Services/general-service';
import { SweetAlert } from '../../Services/SweetAlert';

@Component({
  selector: 'app-jobs',
  imports: [CommonModule, Accordian, RouterLink, TranslateModule, FormsModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class Jobs {
  searchKeyword = '';
  keyword1 = '';
  keyword2 = '';
  selectedCategories: string[] = [];
  selectedLocation: string[] = [];
  selectedJobType: string[] = [];
  selectedPostedDate: string[] = [];
  accordionItems: any[] = [];

  jobs: any[] = [];
  companies: any[] = [];
  selectedCategoriesString = '';
  filteredCompanies: any[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = false;

  constructor(
    private generalService: GeneralService,
    private sweetAlert: SweetAlert
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.Companies(1, 10, () => {
      this.Jobs(1, 10);
    });
  }

  Jobs(page: number, size: number) {
    const payload = { page, size };
    this.isLoading = true;

    this.generalService.post('jobs/getAllJobs', payload).subscribe({
      next: (res: any) => {
        this.jobs = res?.payload?.items || [];
        this.totalPages = res?.payload?.totalPages || 1;
        this.currentPage = res?.payload?.currentPage || page;

        this.jobs = this.jobs.map(job => {
          const matchedCompany = this.companies.find(c => c.companyId === job.companyId);
          return {
            ...job,
            companyLogoUrl: matchedCompany?.companyLogoUrl
          };
        });

        const categories = [...new Set(this.jobs.map(j => j.title))].slice(0, 5);
        const locations = [...new Set(this.jobs.map(j => j.location))];
        const jobTypes = [...new Set(this.jobs.map(j => j.gender))];
        const postedDates = ['LAST 24 HOURS', 'LAST 7 DAYS', 'LAST 14 DAYS', 'LAST 30 DAYS'];

        // accordion bind
        this.accordionItems = [
          { title: 'CATEGORY', content: categories },
          { title: 'LOCATION', content: locations },
          { title: 'JOB_TYPE', content: jobTypes },
          { title: 'POSTED_DATE', content: postedDates }
        ];

        this.isLoading = false;
      },
      error: (err) => {
        const errorMsg = err?.error?.errors?.[0]?.debugMessage || 'Failed to load jobs';
        this.sweetAlert.error(errorMsg, 'Load Failed');
        this.isLoading = false;
      }
    });
  }

  Companies(page: number, size: number, callback?: () => void) {
    const payload = { page, size };
    this.generalService.post('company/getAllCompanies', payload).subscribe({
      next: (res: any) => {
        this.companies = res?.payload?.items || [];
        this.filteredCompanies = [...this.companies];
        if (callback) callback();
      },
      error: (err) => {
        const errorMsg = err?.error?.errors?.[0]?.debugMessage || 'Failed to load companies';
        this.sweetAlert.error(errorMsg, 'Load Failed');
      }
    });
  }

  get filteredJobs() {
    const today = new Date();

    return this.jobs.filter(job => {
      // 1️⃣ Keyword filter (match job title, company name, or any skill)
      const matchesKeyword =
        !this.searchKeyword ||
        job.title.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        job.companyName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        (job.skills as string[])?.some(skill =>
          skill.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );

      // 2️⃣ Category filter
      const matchesCategory =
        this.selectedCategories.length === 0 ||
        this.selectedCategories.includes(job.title);

      // 3️⃣ Location filter
      const matchesLocation =
        this.selectedLocation.length === 0 || this.selectedLocation.includes(job.location);

      // 4️⃣ Job type filter
      const matchesJobType =
        this.selectedJobType.length === 0 || this.selectedJobType.includes(job.gender);

      // 5️⃣ Posted date filter
      let matchesPostedDate = true;
      if (this.selectedPostedDate.length > 0) {
        const jobDate = new Date(job.jobPostedDate);
        matchesPostedDate = this.selectedPostedDate.some(filter => {
          const diff = today.getTime() - jobDate.getTime();
          if (filter === 'LAST_24_HOURS') return diff <= 24 * 60 * 60 * 1000;
          if (filter === 'LAST_7_DAYS') return diff <= 7 * 24 * 60 * 60 * 1000;
          if (filter === 'LAST_14_DAYS') return diff <= 14 * 24 * 60 * 60 * 1000;
          if (filter === 'LAST_30_DAYS') return diff <= 30 * 24 * 60 * 60 * 1000;
          return true;
        });
      }

      return matchesKeyword && matchesCategory && matchesLocation && matchesJobType && matchesPostedDate;
    });
  }

  onCategorySelect(value: string) {
    this.selectedCategories = value ? [value] : [];
  }

  get categoryOptions(): string[] {
    const categoryItem = this.accordionItems.find(i => i.title === 'CATEGORY');
    return categoryItem?.content || [];
  }

  onFilterChanged({ type, event }: any) {
    const value = event.target.value;
    const checked = event.target.checked;

    if (type === 'LOCATION') {
      this.selectedLocation = checked
        ? Array.from(new Set([...this.selectedLocation, value]))
        : this.selectedLocation.filter(loc => loc !== value);
    }
    if (type === 'JOB_TYPE') {
      this.selectedJobType = checked
        ? [...this.selectedJobType, value]
        : this.selectedJobType.filter(jt => jt !== value);
    }

    if (type === 'POSTED_DATE') {
      this.selectedPostedDate = checked
        ? [...this.selectedPostedDate, value]
        : this.selectedPostedDate.filter(pd => pd !== value);
    }

    if (type === 'CATEGORY') {
      this.selectedCategories = checked
        ? [...this.selectedCategories, value]
        : this.selectedCategories.filter(c => c !== value);
    }
  }

  onSearchClick() {
    const kw1 = this.keyword1?.trim().toLowerCase();
    const kw2 = this.keyword2?.trim().toLowerCase();

    this.jobs = this.jobs.filter(job => {
      const title = job.title?.toLowerCase() || '';
      const company = job.companyName?.toLowerCase() || '';
      const skills = (job.skills || []).map((s: string) => s.toLowerCase());

      let match1 = false;
      let match2 = false;

      if (kw1) {
        match1 =
          title.includes(kw1) ||
          company.includes(kw1) ||
          skills.some((s: string) => s.includes(kw1));
      }

      if (kw2) {
        match2 =
          title.includes(kw2) ||
          company.includes(kw2) ||
          skills.some((s: string) => s.includes(kw2));
      }

      if (kw1 && kw2) {
        return match1 || match2;
      }

      else if (kw1) {
        return match1;
      }

      else if (kw2) {
        return match2;
      }

      else {
        return true;
      }
    });
  }

}
