// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const adminData = localStorage.getItem('adminData');

    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);

        if (Date.now() < parsed.expiry) {
          const requiredRoles = route.data['roles'] as Array<string>;
          if (!requiredRoles || requiredRoles.includes(parsed.role)) {
            return true;
          }
        }

        localStorage.removeItem('adminData');
      } catch {
        localStorage.removeItem('adminData');
      }
    }

    this.router.navigate(['/']);
    return false;
  }
}
