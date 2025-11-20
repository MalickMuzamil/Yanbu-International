import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SweetAlert {
  private primaryColor =
    getComputedStyle(document.documentElement)
      .getPropertyValue('--oap-primary')
      .trim() || '#0d6efd';

  private showAlert(
    title: string,
    text: string,
    icon: SweetAlertIcon = 'info'
  ) {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: this.primaryColor,
    });
  }

  success(message: string, title: string = 'Success') {
    return this.showAlert(title, message, 'success');
  }

  error(message: string, title: string = 'Error') {
    return this.showAlert(title, message, 'error');
  }

  warning(message: string, title: string = 'Warning') {
    return this.showAlert(title, message, 'warning');
  }

  info(message: string, title: string = 'Info') {
    return this.showAlert(title, message, 'info');
  }

  confirm(message: string, subMessage?: string): Promise<boolean> {
    return new Promise((resolve) => {
      Swal.fire({
        title: message,
        text: subMessage || '',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        confirmButtonColor: this.primaryColor,
      }).then((result) => resolve(result.isConfirmed));
    });
  }

  confirmWithOptions(
    title: string,
    text: string,
    confirmText: string,
    cancelText: string
  ): Promise<'confirm' | 'cancel' | null> {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      confirmButtonColor: this.primaryColor,
    }).then((result) => {
      if (result.isConfirmed) return 'confirm';
      if (result.dismiss === Swal.DismissReason.cancel) return 'cancel';
      return null;
    });
  }

  cvResumeChoice(
    mode: 'job' | 'resume' = 'resume'
  ): Promise<'apply' | 'update' | 'new' | 'confirm' | 'cancel' | null> {
    if (mode === 'job') {
      return new Promise((resolve) => {
        Swal.fire({
          title: 'Choose an option',
          text: 'How would you like to proceed?',
          icon: 'question',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: 'Apply with Existing CV',
          denyButtonText: 'Update Existing CV',
          cancelButtonText: 'Create New CV',
          reverseButtons: true,
          confirmButtonColor: this.primaryColor,
        }).then((result) => {
          if (result.isConfirmed) return resolve('apply');
          if (result.isDenied) return resolve('update');
          if (result.dismiss === Swal.DismissReason.cancel)
            return resolve('new');
          resolve(null);
        });
      });
    } else {
      return Swal.fire({
        title: 'Previous Resume Found',
        text: 'You have an unfinished resume. Do you want to continue?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue',
        cancelButtonText: 'No, Start New',
        reverseButtons: true,
        confirmButtonColor: this.primaryColor,
      }).then((result) => {
        if (result.isConfirmed) return 'confirm';
        if (result.dismiss === Swal.DismissReason.cancel) return 'cancel';
        return null;
      });
    }
  }
}
