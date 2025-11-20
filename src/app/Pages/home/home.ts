import { Component } from '@angular/core';
import { Hero } from '../../Components/hero/hero';
import { Jobs } from "../../Components/jobs/jobs";
import { About } from '../../Components/about/about';
import { Services } from '../../Components/services/services';
import { Testimonials } from '../../Components/testimonials/testimonials';
import { Marquee } from "../../Components/marquee/marquee";

@Component({
  selector: 'app-home',
  imports: [Hero, About, Jobs, Services, Testimonials, Marquee],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
