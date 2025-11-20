import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import html2pdf from 'html2pdf.js';
import { CvTemplates } from '../../Shared/modals/cv-templates/cv-templates';
import { GeneralService } from '../../Services/general-service';
import { SweetAlert } from '../../Services/SweetAlert';
import { CandidateSidebar } from '../../Components/candidate-sidebar/candidate-sidebar';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-cv-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CvTemplates, CandidateSidebar],
  templateUrl: './cv-builder.html',
  styleUrls: ['./cv-builder.css'],
})
export class CVBuilder {
  cvForm: FormGroup;
  showTemplates = false;
  selectedTemplate = 1;
  isCollapsed = false;
  private isAutoApplying = false;
  private lastCvChoice:
    | 'apply'
    | 'update'
    | 'new'
    | 'confirm'
    | 'cancel'
    | 'none' = 'none';

  activeStep: string = 'heading';
  stepsOrder = [
    'heading',
    'work',
    'education',
    'skills',
    'summary',
    'references',
    'hobbies',
    'additionalInfo',
    'finalize',
  ];

  private isNewResume: boolean = false;
  private lastLoadedData: any = {
    heading: null,
    experience: [],
    education: [],
    skills: [],
    summary: '',
  };

  constructor(
    private fb: FormBuilder,
    private general: GeneralService,
    private swal: SweetAlert,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.cvForm = this.fb.group({
      firstName: ['', Validators.required],
      surname: ['', Validators.required],
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      postcode: ['', Validators.required],
      jobTitle: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9+\-\s()]{6,20}$/)],
      ],
      summary: [''],
      picture: [''],
      education: this.fb.array([]),
      experience: this.fb.array([]),
      skills: [''],
      otherSkills: [''],
      languages: this.fb.array([]),
      references: [''],
      hobbies: [''],
      additionalInfo: this.fb.array([]),
    });

    this.addEducation();
    this.addExperience();
  }

  ngOnInit() {
    this.activeStep = 'heading';

    this.autoApplyJob();
  }

  // ✅ Utility to check control validity in template
  isInvalid(controlName: string, group: FormGroup = this.cvForm): boolean {
    const control = group.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private checkPreviousData() {
    const userId = JSON.parse(localStorage.getItem('userData') || '{}')?.id;
    if (!userId) return;

    this.general.get(`personal-information/get/${userId}`).subscribe({
      next: (res: any) => {
        if (res?.payload) {
          // 🧠 if choice already made in autoApplyJob, skip Swal
          if (this.lastCvChoice !== 'none') {
            switch (this.lastCvChoice) {
              case 'apply':
                // Already applied, do nothing
                break;
              case 'update':
                this.isNewResume = false;
                this.activeStep = 'heading';
                this.loadPersonalInfo();
                break;
              case 'new':
                this.zone.run(() => {
                  this.resetFormToNew();
                  this.cdr.detectChanges();
                });
                break;
            }
            this.lastCvChoice = 'none';
            return;
          }

          // ✅ Otherwise default to new resume
          this.zone.run(() => {
            this.resetFormToNew();
            this.cdr.detectChanges();
          });
        } else {
          this.zone.run(() => {
            this.resetFormToNew();
            this.cdr.detectChanges();
          });
        }
      },
      error: () =>
        this.zone.run(() => {
          this.resetFormToNew();
          this.cdr.detectChanges();
        }),
    });
  }

  private resetFormToNew() {
    this.cvForm.reset();
    (this.cvForm.get('education') as FormArray).clear();
    (this.cvForm.get('experience') as FormArray).clear();
    this.addEducation();
    this.addExperience();
    this.activeStep = 'heading';
    this.isNewResume = true;
    this.lastLoadedData = {
      heading: null,
      experience: [],
      education: [],
      skills: [],
      summary: '',
      references: [],
      hobbies: [],
    };

    console.log('Reset done ✅');
    this.cdr.detectChanges();
  }

  setStep(step: string) {
    this.activeStep = step;
  }

  get fullName() {
    const { firstName, surname } = this.cvForm.value;
    return `${firstName || ''} ${surname || ''}`.trim() || 'Your Name';
  }

  get fullAddress() {
    const { streetAddress, city, country, postcode } = this.cvForm.value;
    return [streetAddress, city, country, postcode].filter(Boolean).join(', ');
  }

  // ---------------- EDUCATION ----------------
  get educationControls(): FormGroup[] {
    return (this.cvForm.get('education') as FormArray).controls as FormGroup[];
  }
  addEducation() {
    this.educationControls.push(
      this.fb.group({
        degree: ['', Validators.required],
        institute: ['', Validators.required],
        from: [''],
        to: [''],
      })
    );
  }
  removeEducation(i: number) {
    (this.cvForm.get('education') as FormArray).removeAt(i);
  }

  // ---------------- EXPERIENCE ----------------
  get experienceControls(): FormGroup[] {
    return (this.cvForm.get('experience') as FormArray).controls as FormGroup[];
  }
  addExperience() {
    (this.cvForm.get('experience') as FormArray).push(
      this.fb.group({
        company: ['', Validators.required],
        role: ['', Validators.required],
        from: [''],
        to: [''],
        details: [''],
      })
    );
  }
  removeExperience(i: number) {
    (this.cvForm.get('experience') as FormArray).removeAt(i);
  }

  // ---------------- LANGUAGES ----------------
  get languageControlsArray(): FormGroup[] {
    return (this.cvForm.get('languages') as FormArray).controls as FormGroup[];
  }
  addLanguage() {
    (this.cvForm.get('languages') as FormArray).push(
      this.fb.group({
        name: ['', Validators.required],
        proficiency: ['', Validators.required],
      })
    );
  }
  removeLanguage(index: number) {
    (this.cvForm.get('languages') as FormArray).removeAt(index);
  }

  // ---------------- ADDITIONAL INFO ----------------
  get additionalInfoControls(): FormGroup[] {
    return (this.cvForm.get('additionalInfo') as FormArray)
      .controls as FormGroup[];
  }
  addAdditionalInfo() {
    (this.cvForm.get('additionalInfo') as FormArray).push(
      this.fb.group({
        type: ['', Validators.required],
        title: ['', Validators.required],
        url: [''],
      })
    );
  }
  removeAdditionalInfo(i: number) {
    (this.cvForm.get('additionalInfo') as FormArray).removeAt(i);
  }

  // Other getters remain the same
  get languagesList(): string {
    const languages = this.cvForm?.value?.languages;
    if (!languages || !Array.isArray(languages)) {
      return 'English';
    }
    return languages
      .map((l: any) => l.name + (l.proficiency ? ` (${l.proficiency})` : ''))
      .join(', ');
  }

  get referencesArray() {
    return (this.cvForm.value.references || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  get hobbiesArray() {
    return (this.cvForm.value.hobbies || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  get skillsArray() {
    return (this.cvForm.value.skills || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  get otherSkillsArray() {
    return (this.cvForm.value.otherSkills || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  get additionalInfoList() {
    const arr = this.cvForm.get('additionalInfo') as FormArray;
    return arr.controls.map((ctrl) => {
      const val = ctrl.value;
      return {
        title: val.title || 'No file chosen',
        url: val.url || null,
      };
    });
  }

  applyTemplate(templateId: number) {
    this.selectedTemplate = templateId;
    this.showTemplates = false;
  }

  // ---------------- FILE UPLOAD ----------------
  downloadPDF() {
    const element = document.getElementById('cv-preview');
    if (!element) return;
    const images = element.getElementsByTagName('img');
    const promises = Array.from(images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
    );
    Promise.all(promises).then(() => {
      html2pdf()
        .set({
          margin: 0.2,
          filename: 'My-CV.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save();
    });
  }

  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.general.uploadFile('company/uploadLogo', file).subscribe({
      next: (res: any) => {
        if (res?.payload?.logoUrl)
          this.cvForm.patchValue({ picture: res.payload.logoUrl });
      },
      error: (err) => console.error('Image upload failed ❌', err),
    });
  }

  onDocumentSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) return;

    this.general.uploadFile('company/uploadLogo', file).subscribe({
      next: (res: any) => {
        const uploadedUrl = res?.payload?.logoUrl;
        if (uploadedUrl) {
          const control = (this.cvForm.get('additionalInfo') as FormArray).at(
            index
          );
          control.patchValue({ url: uploadedUrl });
        }
      },
      error: (err) => console.error('Document upload failed ❌', err),
    });
  }

  // ---------------- GO NEXT ----------------
  goNext() {
    this.cvForm.markAllAsTouched();
    const currentIndex = this.stepsOrder.indexOf(this.activeStep);
    switch (this.activeStep) {
      case 'heading':
        this.saveHeading(currentIndex);
        break;
      case 'work':
        this.saveWorkExperience(currentIndex);
        break;
      case 'education':
        this.saveEducation(currentIndex);
        break;
      case 'skills':
        this.saveSkills(currentIndex);
        break;
      case 'summary':
        this.saveSummary(currentIndex);
        break;
      case 'references':
        this.saveReferences(currentIndex);
        break;
      case 'hobbies':
        this.saveHobbies(currentIndex);
        break;
      case 'additionalInfo':
        this.saveAdditionalInfo(currentIndex);
        break;
      case 'finalize':
        this.finalizeResume();
        break;
    }
  }

  // ---------------- SAVE METHODS ----------------
  private saveHeading(currentIndex: number) {
    const payload = {
      firstName: this.cvForm.value.firstName,
      surname: this.cvForm.value.surname,
      jobTitle: this.cvForm.value.jobTitle,
      email: this.cvForm.value.email,
      phone: this.cvForm.value.phone,
      picture: this.cvForm.value.picture,
      streetAddress: this.cvForm.value.streetAddress,
      city: this.cvForm.value.city,
      country: this.cvForm.value.country,
      postcode: this.cvForm.value.postcode,
    };

    // Create new personal info
    if (this.isNewResume) {
      this.general.post(`personal-information/create`, payload).subscribe({
        next: (res: any) => {
          if (res?.payload?.personalInfoId) {
            localStorage.setItem(
              'personalInfoId',
              res.payload.personalInfoId.toString()
            );
          }

          this.lastLoadedData.heading = { ...this.cvForm.value };
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to save heading';
          this.swal.error(msg);
        },
      });
      return;
    }

    // Skip if no changes
    if (
      JSON.stringify(payload) === JSON.stringify(this.lastLoadedData.heading)
    ) {
      this.activeStep = this.stepsOrder[currentIndex + 1];
      return;
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const personalInfoId = userData?.id;
    if (!personalInfoId) {
      this.swal.error('Missing personal info ID. Please create heading first.');
      return;
    }

    // Update existing personal info
    this.general
      .post(`personal-information/update/${personalInfoId}`, payload)
      .subscribe({
        next: () => {
          this.lastLoadedData.heading = { ...this.cvForm.value };
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to update heading';
          this.swal.error(msg);
        },
      });
  }

  private saveWorkExperience(currentIndex: number) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const personalInfoId = userData?.id;
    if (!personalInfoId) {
      this.swal.error(
        'Missing personal info ID. Please complete the heading step first.'
      );
      return;
    }

    const experiences = this.cvForm.value.experience.map((exp: any) => ({
      personalInfoId: Number(personalInfoId),
      company: exp.company,
      role: exp.role,
      fromDate: exp.from
        ? new Date(exp.from).toISOString().split('T')[0]
        : null,
      toDate: exp.to ? new Date(exp.to).toISOString().split('T')[0] : null,
      details: exp.details,
    }));

    if (this.isNewResume) {
      this.general.post('experience/create', experiences).subscribe({
        next: () => {
          this.lastLoadedData.experience = JSON.parse(
            JSON.stringify(experiences)
          );
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to save experience.';
          this.swal.error(msg);
        },
      });
      return;
    }

    if (
      JSON.stringify(experiences) ===
      JSON.stringify(this.lastLoadedData.experience)
    ) {
      this.activeStep = this.stepsOrder[currentIndex + 1];
      return;
    }

    this.general.post('experience/update', experiences).subscribe({
      next: () => {
        this.lastLoadedData.experience = JSON.parse(
          JSON.stringify(experiences)
        );
        this.activeStep = this.stepsOrder[currentIndex + 1];
      },
      error: (err) => {
        const msg =
          err?.error?.errors?.[0]?.errorPromptMessage ||
          'Failed to update experience.';
        this.swal.error(msg);
      },
    });
  }

  private saveEducation(currentIndex: number) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const personalInfoId = userData?.id;
    if (!personalInfoId) {
      this.swal.error(
        'Missing personal info ID. Please complete the heading step first.'
      );
      return;
    }

    const educationPayload = (
      this.cvForm.get('education') as FormArray
    ).controls
      .map((ctrl) => {
        const edu = ctrl.value;
        if (!edu.degree && !edu.institute && !edu.from && !edu.to) return null;
        return {
          personalInfoId: Number(personalInfoId),
          degree: edu.degree,
          institute: edu.institute,
          fromDate: edu.from
            ? new Date(edu.from).toISOString().split('T')[0]
            : null,
          toDate: edu.to ? new Date(edu.to).toISOString().split('T')[0] : null,
        };
      })
      .filter(Boolean);

    if (this.isNewResume) {
      this.general.post('education/create', educationPayload).subscribe({
        next: () => {
          this.lastLoadedData.education = JSON.parse(
            JSON.stringify(educationPayload)
          );
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to save education.';
          this.swal.error(msg);
        },
      });
      return;
    }

    if (
      JSON.stringify(educationPayload) ===
      JSON.stringify(this.lastLoadedData.education)
    ) {
      this.activeStep = this.stepsOrder[currentIndex + 1];
      return;
    }

    if (educationPayload.length) {
      this.general.post('education/update', educationPayload).subscribe({
        next: () => {
          this.lastLoadedData.education = JSON.parse(
            JSON.stringify(educationPayload)
          );
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to update education.';
          this.swal.error(msg);
        },
      });
    } else {
      this.activeStep = this.stepsOrder[currentIndex + 1];
    }
  }

  private saveSkills(currentIndex: number) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const personalInfoId = userData?.id;
    if (!personalInfoId) {
      this.swal.error(
        'Missing personal info ID. Please complete the heading step first.'
      );
      return;
    }

    const skills = this.skillsArray;
    const languages = this.languageControlsArray.map(
      (control) => control.value
    );
    const payload = { skills, languages };

    if (this.isNewResume) {
      this.general
        .post(`personal-information/createSkills/${personalInfoId}`, payload)
        .subscribe({
          next: () => {
            this.lastLoadedData.skills = [...skills];
            this.lastLoadedData.languages = [...languages];
            this.activeStep = this.stepsOrder[currentIndex + 1];
          },
          error: (err) => {
            const msg =
              err?.error?.errors?.[0]?.errorPromptMessage ||
              'Failed to save skills.';
            this.swal.error(msg);
          },
        });
      return;
    }

    if (
      JSON.stringify(payload.skills) ===
        JSON.stringify(this.lastLoadedData.skills) &&
      JSON.stringify(payload.languages) ===
        JSON.stringify(this.lastLoadedData.languages)
    ) {
      this.activeStep = this.stepsOrder[currentIndex + 1];
      return;
    }

    this.general
      .post(`personal-information/updateSkills/${personalInfoId}`, payload)
      .subscribe({
        next: () => {
          this.lastLoadedData.skills = [...skills];
          this.lastLoadedData.languages = [...languages];
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to update skills.';
          this.swal.error(msg);
        },
      });
  }

  private saveSummary(currentIndex: number) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const personalInfoId = userData?.id;
    if (!personalInfoId) {
      this.swal.error(
        'Missing personal info ID. Please complete the heading step first.'
      );
      return;
    }

    const summary = this.cvForm.value.summary;

    if (this.isNewResume) {
      this.general
        .post(
          `personal-information/createProfessionalSummary/${personalInfoId}`,
          summary
        )
        .subscribe({
          next: () => {
            this.lastLoadedData.summary = summary;
            this.activeStep = this.stepsOrder[currentIndex + 1];
          },
          error: (err) => {
            const msg =
              err?.error?.errors?.[0]?.errorPromptMessage ||
              'Failed to save summary.';
            this.swal.error(msg);
          },
        });
      return;
    }

    if (summary === this.lastLoadedData.summary) {
      this.activeStep = this.stepsOrder[currentIndex + 1];
      return;
    }

    this.general
      .post(
        `personal-information/updateProfessionalSummary/${personalInfoId}`,
        summary
      )
      .subscribe({
        next: () => {
          this.lastLoadedData.summary = summary;
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to update summary.';
          this.swal.error(msg);
        },
      });
  }

  private saveReferences(currentIndex: number) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const personalInfoId = userData?.id;
    if (!personalInfoId) {
      this.swal.error(
        'Missing personal info ID. Please complete the heading step first.'
      );
      return;
    }

    const references = this.referencesArray;

    if (this.isNewResume) {
      this.general
        .post(`reference/createReference/${personalInfoId}`, references)
        .subscribe({
          next: () => {
            this.lastLoadedData.references = references;
            this.activeStep = this.stepsOrder[currentIndex + 1];
          },
          error: (err) => {
            const msg =
              err?.error?.errors?.[0]?.errorPromptMessage ||
              'Failed to save references.';
            this.swal.error(msg);
          },
        });
      return;
    }

    if (
      JSON.stringify(references) ===
      JSON.stringify(this.lastLoadedData.references)
    ) {
      this.activeStep = this.stepsOrder[currentIndex + 1];
      return;
    }

    this.general
      .post(`reference/updateReference/${personalInfoId}`, references)
      .subscribe({
        next: () => {
          this.lastLoadedData.references = references;
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to update references.';
          this.swal.error(msg);
        },
      });
  }

  private saveHobbies(currentIndex: number) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const personalInfoId = userData?.id;
    if (!personalInfoId) {
      this.swal.error(
        'Missing personal info ID. Please complete the heading step first.'
      );
      return;
    }

    const hobbies = this.hobbiesArray;

    if (this.isNewResume) {
      this.general
        .post(`hobbies/createHobbies/${personalInfoId}`, hobbies)
        .subscribe({
          next: () => {
            this.lastLoadedData.hobbies = hobbies;
            this.activeStep = this.stepsOrder[currentIndex + 1];
          },
          error: (err) => {
            const msg =
              err?.error?.errors?.[0]?.errorPromptMessage ||
              'Failed to save hobbies.';
            this.swal.error(msg);
          },
        });
      return;
    }

    if (
      JSON.stringify(hobbies) === JSON.stringify(this.lastLoadedData.hobbies)
    ) {
      this.activeStep = this.stepsOrder[currentIndex + 1];
      return;
    }

    this.general
      .post(`hobbies/updateHobbies/${personalInfoId}`, hobbies)
      .subscribe({
        next: () => {
          this.lastLoadedData.hobbies = hobbies;
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to update hobbies.';
          this.swal.error(msg);
        },
      });
  }

  private saveAdditionalInfo(currentIndex: number) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const personalInfoId = userData?.id;
    if (!personalInfoId) {
      this.swal.error(
        'Missing personal info ID. Please complete the heading step first.'
      );
      return;
    }

    const additionalInfo = this.cvForm.value.additionalInfo;

    if (this.isNewResume) {
      this.general
        .post(`reference/createResources/${personalInfoId}`, additionalInfo)
        .subscribe({
          next: () => {
            this.lastLoadedData.additionalInfo = JSON.parse(
              JSON.stringify(additionalInfo)
            );
            this.activeStep = this.stepsOrder[currentIndex + 1];
          },
          error: (err) => {
            const msg =
              err?.error?.errors?.[0]?.errorPromptMessage ||
              'Failed to save additional info.';
            this.swal.error(msg);
          },
        });
      return;
    }

    if (
      JSON.stringify(additionalInfo) ===
      JSON.stringify(this.lastLoadedData.additionalInfo)
    ) {
      this.activeStep = this.stepsOrder[currentIndex + 1];
      return;
    }

    this.general
      .post(`reference/updateResources/${personalInfoId}`, additionalInfo)
      .subscribe({
        next: () => {
          this.lastLoadedData.additionalInfo = JSON.parse(
            JSON.stringify(additionalInfo)
          );
          this.activeStep = this.stepsOrder[currentIndex + 1];
        },
        error: (err) => {
          const msg =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Failed to update additional info.';
          this.swal.error(msg);
        },
      });
  }

  private applyExistingCV(userId: string, jobId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!userId || !jobId) return resolve();

      const payload = {
        jobId: jobId,
        personalInfoId: userId,
        apply: true,
      };

      this.general
        .post('candidateApplication/submitApplication', payload)
        .subscribe({
          next: () => {
            this.swal.success('Applied successfully with your existing CV! 🎉');
            resolve();
          },
          error: (err) => {
            console.error('Error applying existing CV ❌', err);
            this.swal.error('Failed to apply using your existing CV.');
            resolve(); // resolve anyway to avoid blocking the flow
          },
        });
    });
  }

  private autoApplyJob(): Promise<void> {
    return new Promise((resolve) => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const jobId = localStorage.getItem('jobId');

      this.zone.run(() => {
        this.swal.cvResumeChoice('job').then((choice) => {
          this.lastCvChoice = choice || 'none';

          switch (choice) {
            case 'apply':
              if (userData?.id && jobId) {
                this.applyExistingCV(userData.id, Number(jobId)).then(resolve);
              } else {
                this.swal.info('Cannot apply: missing user or job ID.');
                resolve();
              }
              break;

            case 'update':
              this.isNewResume = false;
              this.activeStep = 'heading';
              this.loadPersonalInfo().then((found) => {
                if (found) {
                  this.swal.success('Loaded your previous CV for update.');
                } else {
                  this.swal.warning(
                    'No existing CV found — starting a new one.'
                  );
                  this.resetFormToNew();
                }
                resolve();
              });
              break;

            case 'new':
              this.resetFormToNew();
              this.swal.info('Starting a new CV.');
              resolve();
              break;

            default:
              resolve();
              break;
          }
        });
      });
    });
  }

  private finalizeResume() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData?.id;
    const personalInfoId = userData?.personalInfoId;
    const jobId = localStorage.getItem('jobId');

    if (!userId) return;

    let payload: any = {};

    if (jobId) {
      payload = {
        jobId: jobId,
        personalInfoId: personalInfoId,
        apply: true,
      };
    } else {
      payload = {
        apply: false,
      };
    }

    this.general
      .post('candidateApplication/submitApplication', payload)
      .subscribe({
        next: () => {
          this.swal.success('Resume finalized & applied successfully! 🎉');
          this.activeStep = 'finalize';
        },
        error: (err) => {
          console.error('Finalize request failed ❌', err);
          this.swal.error('Something went wrong while finalizing resume!');
        },
      });
  }

  isCompleted(step: string): boolean {
    return (
      this.stepsOrder.indexOf(step) < this.stepsOrder.indexOf(this.activeStep)
    );
  }
  // ✅ Load Methods
  loadPersonalInfo(): Promise<boolean> {
    if (this.isNewResume) return Promise.resolve(false);

    const userId = JSON.parse(localStorage.getItem('userData') || '{}')?.id;

    return new Promise<boolean>((resolve) => {
      this.general.get(`personal-information/get/${userId}`).subscribe({
        next: (res) => {
          if (res?.payload) {
            // ✅ Patch the form normally
            this.cvForm.patchValue({
              firstName: res.payload.firstName || '',
              surname: res.payload.surname || '',
              streetAddress: res.payload.streetAddress || '',
              city: res.payload.city || '',
              country: res.payload.country || '',
              postcode: res.payload.postcode || '',
              jobTitle: res.payload.jobTitle || '',
              email: res.payload.email || '',
              phone: res.payload.phone || '',
              summary: res.payload.professionalSummary || '',
              picture: res.payload.picture || '',
              skills: res.payload.skills?.join(', ') || '',
            });

            this.lastLoadedData.heading = { ...this.cvForm.value };
            this.lastLoadedData.skills = [...(res.payload.skills || [])];
            this.lastLoadedData.summary = res.payload.professionalSummary || '';

            this.loadExperience();
            this.loadEducation();
            this.loadSkills();
            this.loadSummary();
            this.loadReferences();
            this.loadHobbies();
            this.loadAdditionalInfo();

            resolve(true); // ✅ Successfully loaded
          } else {
            resolve(false); // ❌ No data found
          }
        },
        error: (err) => {
          // ✅ Handle "NOT_FOUND" cleanly
          const backendMessage =
            err?.error?.errors?.[0]?.errorPromptMessage ||
            'Error loading CV data';
          console.error('loadPersonalInfo error:', backendMessage);
          this.swal.warning(backendMessage);
          resolve(false); // ❌ Error means no CV found
        },
      });
    });
  }

  loadExperience() {
    if (this.isNewResume) return;
    const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
    this.general.get(`experience/get/${userId}`).subscribe((res) => {
      if (res?.payload) {
        const expArray = this.cvForm.get('experience') as FormArray;
        expArray.clear();
        res.payload.forEach((exp: any) =>
          expArray.push(
            this.fb.group({
              company: exp.company || '',
              role: exp.role || '',
              from: exp.fromDate || '',
              to: exp.toDate || '',
              details: exp.details || '',
            })
          )
        );
        this.lastLoadedData.experience = JSON.parse(
          JSON.stringify(
            res.payload.map((exp: any) => ({
              personalInfoId: userId,
              company: exp.company,
              role: exp.role,
              fromDate: exp.fromDate,
              toDate: exp.toDate,
              details: exp.details,
            }))
          )
        );
      }
    });
  }

  loadEducation() {
    if (this.isNewResume) return;
    const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
    this.general.get(`education/get/${userId}`).subscribe((res) => {
      if (res?.payload) {
        const eduArray = this.cvForm.get('education') as FormArray;
        eduArray.clear();
        res.payload.forEach((edu: any) =>
          eduArray.push(
            this.fb.group({
              degree: edu.degree || '',
              institute: edu.institute || '',
              from: edu.fromDate || '',
              to: edu.toDate || '',
            })
          )
        );
        this.lastLoadedData.education = JSON.parse(
          JSON.stringify(
            res.payload.map((edu: any) => ({
              personalInfoId: userId,
              degree: edu.degree,
              institute: edu.institute,
              fromDate: edu.fromDate,
              toDate: edu.toDate,
            }))
          )
        );
      }
    });
  }

  loadSkills() {
    if (this.isNewResume) return;

    const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
    this.general.get(`personal-information/getSkills/${userId}`).subscribe({
      next: (res: any) => {
        if (res?.payload) {
          this.cvForm.patchValue({
            skills: (res.payload.skills || []).join(', '),
          });

          const langArray = this.cvForm.get('languages') as FormArray;
          langArray.clear();
          (res.payload.languages || []).forEach((l: any) =>
            langArray.push(
              this.fb.group({
                name: l.name || '',
                proficiency: l.proficiency || '',
              })
            )
          );
        }
      },
    });
  }

  loadSummary() {
    if (this.isNewResume) return;

    const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;

    this.general
      .get(`personal-information/getProfessionalSummary/${userId}`)
      .subscribe({
        next: (res: any) => {
          if (res?.payload) {
            let summaryText: string | any = res.payload;

            // If backend returns stringified JSON, try to parse it
            if (typeof summaryText === 'string') {
              try {
                summaryText = JSON.parse(summaryText);
              } catch {
                // leave as string if parsing fails
              }
            }

            this.cvForm.patchValue({
              summary: summaryText || '',
            });

            this.lastLoadedData.summary = summaryText || '';
            console.log('Summary loaded ✅', this.lastLoadedData.summary);
          } else {
            console.warn('Summary response payload empty');
          }
        },
        error: (err) => console.error('Error loading summary ❌', err),
      });
  }

  loadReferences() {
    if (this.isNewResume) return;
    const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;

    this.general.get(`reference/getReference/${userId}`).subscribe({
      next: (res: any) => {
        if (res?.payload) {
          let referencesData: any = res.payload;
          if (typeof referencesData === 'string') {
            try {
              referencesData = JSON.parse(referencesData);
            } catch {}
          }

          // ✅ Safe patch with deep copy
          if (Array.isArray(referencesData)) {
            this.cvForm.patchValue({
              references: [...referencesData].join(', '),
            });
            this.lastLoadedData.references = [...referencesData];
          } else if (typeof referencesData === 'string') {
            this.cvForm.patchValue({ references: referencesData });
            this.lastLoadedData.references = [referencesData];
          }
        }
      },
    });
  }

  loadHobbies() {
    if (this.isNewResume) return;
    const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;

    this.general.get(`hobbies/getHobbies/${userId}`).subscribe({
      next: (res: any) => {
        if (res?.payload) {
          let hobbiesData: any = res.payload;
          if (typeof hobbiesData === 'string') {
            try {
              hobbiesData = JSON.parse(hobbiesData);
            } catch {}
          }

          // ✅ Safe patch with deep copy
          if (Array.isArray(hobbiesData)) {
            this.cvForm.patchValue({ hobbies: [...hobbiesData].join(', ') });
            this.lastLoadedData.hobbies = [...hobbiesData];
          } else if (typeof hobbiesData === 'string') {
            this.cvForm.patchValue({ hobbies: hobbiesData });
            this.lastLoadedData.hobbies = [hobbiesData];
          }
        }
      },
    });
  }

  loadAdditionalInfo() {
    if (this.isNewResume) return;
    const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
    this.general.get(`reference/getResources/${userId}`).subscribe((res) => {
      if (res?.payload) {
        const arr = this.cvForm.get('additionalInfo') as FormArray;
        arr.clear();
        res.payload.forEach((item: any) =>
          arr.push(
            this.fb.group({
              type: item.type || '',
              title: item.title || '',
              url: item.url || '',
            })
          )
        );
        this.lastLoadedData.additionalInfo = JSON.parse(
          JSON.stringify(res.payload)
        );
      }
    });
  }
}
