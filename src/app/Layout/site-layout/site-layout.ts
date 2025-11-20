import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../Shared/navbar/navbar';
// import { Footer } from '../../Shared/footer/footer';
import { Footer2 } from '../../Shared/footer-2/footer-2';

import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-site-layout',
  imports: [RouterOutlet, Navbar, Footer2, CommonModule],
  templateUrl: './site-layout.html',
  styleUrl: './site-layout.css'
})
export class SiteLayout {

  //   isHomePage: boolean = false;

  // constructor(private router: Router) {
  //   this.router.events
  //     .pipe(filter(event => event instanceof NavigationEnd))
  //     .subscribe((event: any) => {
  //       this.isHomePage = event.urlAfterRedirects === '/' || event.url === '/';
  //     });
  // }

}
