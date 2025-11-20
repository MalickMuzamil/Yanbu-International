import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserAuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const userData = localStorage.getItem('userData');

    if (userData) {
      try {
        const parsed = JSON.parse(userData);

        // Check if session is still valid
        if (Date.now() < parsed.expiry) {
          return true; // Allow access
        }

        // Expired session → remove data
        localStorage.removeItem('userData');
      } catch {
        localStorage.removeItem('userData');
      }
    }

    // No valid session → redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}
