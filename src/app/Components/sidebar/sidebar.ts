import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../../Services/general-service';
import { DailogBox } from '../../Shared/dailog-box/dailog-box';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [DailogBox, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
   adminEmail: string = '';
  showLogoutModal = false;

  constructor(private generalService: GeneralService) {}

  ngOnInit(): void {
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
    this.adminEmail = adminData.email || '';
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
