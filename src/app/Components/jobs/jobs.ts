import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GeneralService } from '../../Services/general-service';
import { SweetAlert } from '../../Services/SweetAlert';
import { CommonModule } from '@angular/common';

import * as countries from 'i18n-iso-countries';
import * as enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale);

@Component({
  selector: 'app-jobs',
  imports: [RouterLink, TranslateModule, CommonModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class Jobs {
  jobs: any[] = [];
  companies: any[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = false;

  constructor(
    private generalService: GeneralService,
    private sweetAlert: SweetAlert,
    private router: Router
  ) {}

  ngOnInit() {
    this.Companies(1, 10, () => {
      this.Jobs(1, 10);
    });
  }

  getFlagUrlFromNationality(countryName: string | null): string | null {
    if (!countryName) return null;

    let code = countries.getAlpha2Code(countryName, 'en');

    if (!code && countryName.length <= 3) {
      code = countryName.toUpperCase();
    }

    if (!code) {
      const normalised = countryName.trim().toLowerCase();
      const allNames = countries.getNames('en');

      let matchedKey = Object.keys(allNames).find(
        key => allNames[key].toLowerCase() === normalised
      );

      if (!matchedKey) {
        matchedKey = Object.keys(allNames).find(key =>
          normalised.includes(allNames[key].toLowerCase())
        );
      }

      if (matchedKey) code = matchedKey;
    }

    return code ? `https://flagsapi.com/${code.toUpperCase()}/flat/32.png` : null;
  }

  Companies(page: number, size: number, callback?: () => void) {
    const payload = { page, size };
    this.generalService.post('company/getAllCompanies', payload).subscribe({
      next: (res: any) => {
        this.companies = res?.payload?.items || [];
        if (callback) callback();
      },
      error: (err) => {
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to load companies';
        this.sweetAlert.error(errorMsg, 'Load Failed');
      },
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

        this.jobs = this.jobs.map((job) => {
          const matchedCompany = this.companies.find(
            (c) => c.companyId === job.companyId
          );

          const flagUrl = this.getFlagUrlFromNationality(job.nationality);

          // debug
          console.log('job:', job.title, 'nationality:', job.nationality, 'flag:', flagUrl);

          return {
            ...job,
            ...matchedCompany,
            companyName: matchedCompany?.companyName || job.companyName,
            companyLogoUrl: matchedCompany?.companyLogoUrl,
            flagUrl
          };
        });

        this.isLoading = false;
      },
      error: (err) => {
        const errorMsg =
          err?.error?.errors?.[0]?.debugMessage || 'Failed to load jobs';
        this.sweetAlert.error(errorMsg, 'Load Failed');
        this.isLoading = false;
      },
    });
  }
}
