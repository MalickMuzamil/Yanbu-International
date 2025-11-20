import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { SweetAlert } from '../../Services/SweetAlert';
import { Router, RouterLink } from '@angular/router';
import { GeneralService } from '../../Services/general-service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private swal: SweetAlert,
    private router: Router,
    private generalService: GeneralService
  ) {
    this.signupForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        acceptTerms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  };

  onSubmit() {
    if (this.signupForm.invalid) {
      if (this.signupForm.errors?.['mismatch']) {
        this.swal.error('Passwords do not match!');
      } else {
        this.swal.error('Please fill all fields correctly!');
      }
      return;
    }

    const payload = {
      email: this.signupForm.value.email,
      name: `${this.signupForm.value.firstName} ${this.signupForm.value.lastName}`,
      password: this.signupForm.value.password,
    };

    this.generalService.post('user/registerCandidate', payload).subscribe({
      next: (res: any) => {
        this.swal.success('Signup Successful!');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        const backendMessage =
          err?.error?.errors?.[0]?.errorPromptMessage ||
          'Signup Failed! Please try again.';
        this.swal.error(backendMessage);
      },
    });
  }

  get f() {
    return this.signupForm.controls;
  }
}
