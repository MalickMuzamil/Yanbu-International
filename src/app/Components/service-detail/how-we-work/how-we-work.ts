import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeneralService } from '../../../Services/general-service';
import { SweetAlert } from '../../../Services/SweetAlert';

@Component({
  selector: 'app-how-we-work',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './how-we-work.html',
  styleUrl: './how-we-work.css',
})
export class HowWeWork {
  form: FormGroup;

  constructor(private fb: FormBuilder, private general: GeneralService, private swal: SweetAlert) {
    this.form = this.fb.group({
      companyName: ['', Validators.required],
      contactName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9+\-\s()]{6,20}$/)],
      ],
      roleTitle: ['', Validators.required],
      location: ['', Validators.required],
      salaryRange: ['', Validators.required],
      jobDescription: ['', Validators.required],
      urgency: ['', Validators.required],
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;

    this.general.post('hiretalent/create', payload).subscribe({
      next: (res) => {
       this.swal.success('Form submitted successfully ✅', 'Thank you!');
      
      this.form.reset();
      },
      error: (err) => {
        console.error('Form submission failed ❌', err);
      },
    });
  }
}
