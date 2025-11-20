import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    currentLang: 'en' | 'ar' = 'en';

    constructor(private translate: TranslateService) {
        this.setLanguage('en'); 
    }

    setLanguage(lang: 'en' | 'ar') {
        this.currentLang = lang;
        this.translate.use(lang);

        document.documentElement.lang = lang;
        document.documentElement.dir = 'ltr'; 
    }

    toggleLanguage() {
        this.setLanguage(this.currentLang === 'en' ? 'ar' : 'en');
    }
}
