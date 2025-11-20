import { Routes } from '@angular/router';
import { SiteLayout } from './Layout/site-layout/site-layout';
import { Home } from './Pages/home/home';
import { Jobs } from './Pages/jobs/jobs';
import { Services } from './Pages/services/services';
import { AdminPage } from './Pages/admin-pages/admin-page/admin-page';
import { AppLayout } from './Layout/app-layout/app-layout';
import { AdminJobs } from './Pages/admin-pages/admin-jobs/admin-jobs';
import { JobView } from './Pages/job-view/job-view';
import { AdminCompany } from './Pages/admin-pages/admin-company/admin-company';
import { CVBuilder } from './Pages/cv-builder/cv-builder';
import { AuthGuard } from './guards/auth.guard';
import { UserAuthGuard } from './guards/user-auth.guard';
import { Login } from './Pages/login/login';
import { Signup } from './Pages/signup/signup';
import { UserLoginGuard } from './guards/user-login.guard';
import { ShowCompaniesJobs } from './Pages/admin-pages/show-companies-jobs/show-companies-jobs';
import { CandidatePortal } from './Pages/candidate-portal/candidate-portal';
import { AdminTalent } from './Pages/admin-pages/admin-talent/admin-talent';

export const routes: Routes = [
  {
    path: '',
    component: SiteLayout,
    children: [
      {
        path: '',
        component: Home,
      },

      {
        path: 'jobs',
        component: Jobs,
      },
      {
        path: 'job/:id',
        component: JobView,
      },
      {
        path: 'services',
        component: Services,
      },
    ],
  },

  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: 'admin',
        component: AdminPage,
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'admin-jobs',
        component: AdminJobs,
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'admin-companies',
        component: AdminCompany,
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'admin-talents',
        component: AdminTalent,
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'show-companies-jobs',
        component: ShowCompaniesJobs,
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
      },

      {
        path: 'candidate-portal',
        canActivate: [UserAuthGuard],
        component: CandidatePortal,
      },

      {
        path: 'cv-builder',
        canActivate: [UserAuthGuard],
        component: CVBuilder,
      },

      {
        path: 'login',
        canActivate: [UserLoginGuard],
        component: Login,
      },

      {
        path: 'signup',
        component: Signup,
      },
    ],
  },
];
