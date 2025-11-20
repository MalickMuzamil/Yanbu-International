import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../Services/language/language.service';

@Component({
  selector: 'app-hero',
  imports: [ TranslateModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {
  constructor(public langService: LanguageService) { }
}
