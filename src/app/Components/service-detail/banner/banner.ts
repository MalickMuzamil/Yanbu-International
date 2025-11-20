import { Component } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css'
})
export class Banner {
Toscroll(){
  const el = document.getElementById('talentForm');
  if(el){
    el.scrollIntoView({behavior: 'smooth'});
  }
}
}
