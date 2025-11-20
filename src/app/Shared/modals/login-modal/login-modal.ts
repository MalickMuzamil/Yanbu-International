import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GeneralService } from '../../../Services/general-service';
import { Router } from '@angular/router';
import { SweetAlert } from '../../../Services/SweetAlert';

declare var bootstrap: any;

@Component({
  selector: 'app-login-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css'
})
export class LoginModal {
  isOpen = false;
  loginForm: FormGroup;
  submitting = false;

  constructor(private fb: FormBuilder, private generalService: GeneralService, private router: Router, private sweetAlert: SweetAlert) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  open() {
    this.isOpen = true;
    document.body.classList.add('modal-open');
  }

  close() {
    this.isOpen = false;
    document.body.classList.remove('modal-open');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.submitting = true;
      const credentials = this.loginForm.value;

      this.generalService.post('user/login', credentials).subscribe({
        next: (res) => {
          console.log('Login success:', res);

          const userPayload = res?.payload;
          if (userPayload) {
            const expiry = Date.now() + 2 * 24 * 60 * 60 * 1000;
            const adminData = {
              ...userPayload,
              expiry,
              role: userPayload.role || 'admin'
            };
            localStorage.setItem('adminData', JSON.stringify(adminData));
          }

          this.loginForm.reset();
          this.closeModal();
          this.router.navigate(['/admin']);

          this.sweetAlert.success('You are logged in successfully!');
        },

        error: (err) => {
          console.error('Login error:', err);
          const errorMsg = err?.error?.errors?.[0]?.debugMessage || 'Something went wrong!';

          // ✅ Error Alert via service
          this.sweetAlert.error(errorMsg, 'Login Failed');

          this.loginForm.reset();
          this.closeModal();
        },
      });
    }
  }


  // onSubmit(): void {
  //   if (this.loginForm.valid) {
  //     Swal.fire({
  //       title: 'Login Successful',
  //       text: 'Welcome Admin!',
  //       icon: 'success',
  //       confirmButtonColor: '#198754',
  //     }).then(() => {
  //       this.loginForm.reset();
  //       this.close();
  //       this.router.navigate(['/admin']);
  //     });
  //   } else {
  //     Swal.fire({
  //       title: 'Login Failed',
  //       text: 'Please enter valid email and password.',
  //       icon: 'error',
  //       confirmButtonColor: '#dc3545',
  //     });
  //   }
  // }


  closeModal(): void {
    const modalElement = document.getElementById('loginModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }
}
