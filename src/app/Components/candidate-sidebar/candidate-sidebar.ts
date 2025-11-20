
import { Component } from '@angular/core';
import { GeneralService } from '../../Services/general-service';
import { DailogBox } from '../../Shared/dailog-box/dailog-box';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidate-sidebar',
  imports: [DailogBox, RouterModule, CommonModule],
  templateUrl: './candidate-sidebar.html',
  styleUrl: './candidate-sidebar.css',
})
export class CandidateSidebar {
  showLogoutModal = false;
  userEmail: string = '';
  userName: string = '';

  constructor(private generalService: GeneralService) {}

  ngOnInit(): void {
    const userData  = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userEmail = userData.email || '';
    this.userName = userData.name || '';
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  handleLogoutConfirm() {
    this.showLogoutModal = false;
    this.logout();
  }

  handleLogoutCancel() {
    this.showLogoutModal = false;
  }

  logout() {
    this.generalService.logout();
  }
}
