import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GeneralService } from '../../../Services/general-service';
import { CommonModule } from '@angular/common';
import { SweetAlert } from '../../../Services/SweetAlert';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  @Input() jobTitle: string = '';
  @Input() jobId!: number;

  applicationForm!: FormGroup;
  isUploading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private general: GeneralService,
    private sweetAlert: SweetAlert
  ) {}

  ngOnInit() {
    this.applicationForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      trainingVideo: [''],
      resume: ['', Validators.required],
    });
  }

  onResumeSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    this.general.uploadFile('company/uploadLogo', file).subscribe({
      next: (res: any) => {
        const url = res?.payload?.logoUrl;
        if (url) {
          this.applicationForm.patchValue({ resume: url });
          console.log('Resume uploaded ✅', url);
        }
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Resume upload failed ❌', err);
        this.isUploading = false;
      },
    });
  }

  submitApplication() {
    if (this.isUploading) {
      this.sweetAlert.warning(
        'Please wait, your resume is still uploading...',
        'Uploading in progress'
      );
      return;
    }

    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = {
      ...this.applicationForm.value,
      applicationType: 'EASY_APPLY',
      jobId: this.jobId,
    };

    this.general.post('candidateApplication/EasyApply', payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res?.status === 'OK') {
          this.sweetAlert.success(
            'Your application has been submitted!',
            'Success'
          );
          localStorage.removeItem('jobId');
          const modal = document.getElementById('signUpModal');
          if (modal) {
            (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
          }

          this.applicationForm.reset();
        }
        
        else {
          this.sweetAlert.error('Something went wrong.', 'Error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMessage =
          err?.error?.errors?.[0]?.errorPromptMessage ||
          'Application submission failed ❌';
        this.sweetAlert.error(errorMessage, 'Error');
        localStorage.removeItem('jobId');
        console.error('Application submission failed ❌', err);
      },
    });
  }
}
