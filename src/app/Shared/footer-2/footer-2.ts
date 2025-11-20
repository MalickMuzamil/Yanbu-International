import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ViewChild } from '@angular/core';
import { LoginModal } from '../modals/login-modal/login-modal';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer-2',
  imports: [RouterLink, LoginModal, TranslateModule],
  templateUrl: './footer-2.html',
  styleUrl: './footer-2.css'
})
export class Footer2 {
  @ViewChild(LoginModal) loginModal!: LoginModal;

  openLogin() {
    this.loginModal.open();
  }
}
