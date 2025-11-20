import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../Services/language/language.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, TranslateModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  currentLang: 'en' | 'ar' = 'en';

  constructor(
    private translate: TranslateService,
    public langService: LanguageService
  ) {
    this.translate.setFallbackLang('en');
    this.translate.use(this.currentLang);
    document.dir = 'ltr';
  }

  toggleLanguage() {
    this.langService.toggleLanguage();
  }

  closeNavbar() {
    const navbar = document.getElementById('navbarNav');
    if (navbar) {
      const bsCollapse = new (window as any).bootstrap.Collapse(navbar, {
        toggle: false,
      });
      bsCollapse.hide();
    }
  }
}
