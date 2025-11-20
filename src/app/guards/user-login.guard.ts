import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserLoginGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const userData = localStorage.getItem('userData');

    if (userData) {
      try {
        const parsed = JSON.parse(userData);

        // If session is valid, redirect to cv-builder
        if (Date.now() < parsed.expiry) {
          return this.router.parseUrl('/cv-builder');
        }

        // Expired session → remove data
        localStorage.removeItem('userData');
      } catch {
        localStorage.removeItem('userData');
      }
    }

    return true; // Allow login page
  }
}
