import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SweetAlert } from '../../Services/SweetAlert';
import { GeneralService } from '../../Services/general-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private swal: SweetAlert,
    private router: Router,
    private generalService: GeneralService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember_me: [false],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.swal.error('Please fill all fields correctly!');
      return;
    }

    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      role: 'CANDIDATE'
    };

    this.generalService.post('user/login', payload).subscribe({
      next: (res: any) => {
        this.swal.success('Login Successful!');

        if (res?.payload) {
          const userWithExpiry = {
            ...res.payload,
            expiry: Date.now() + 24 * 60 * 60 * 1000,
          };
          localStorage.setItem('userData', JSON.stringify(userWithExpiry));
        }

        this.router.navigate(['/candidate-portal']);
      },
      error: (err: any) => {
        const backendMessage =
          err?.error?.errors?.[0]?.errorPromptMessage ||
          'Login Failed! Please try again.';
        this.swal.error(backendMessage);
      },
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
