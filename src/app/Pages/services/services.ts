import { Component } from '@angular/core';
import { Banner } from '../../Components/service-detail/banner/banner';
import { Stats } from '../../Components/service-detail/stats/stats';
import { Clients } from '../../Components/service-detail/clients/clients';
import { HowWeWork } from '../../Components/service-detail/how-we-work/how-we-work';
// import { Testimonial } from '../../Components/service-detail/testimonial/testimonial;



@Component({
  selector: 'app-services',
  imports: [Banner, Stats, Clients, HowWeWork],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services {

}
