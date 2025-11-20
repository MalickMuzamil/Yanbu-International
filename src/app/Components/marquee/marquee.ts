import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-marquee',
  imports: [CommonModule],
  templateUrl: './marquee.html',
  styleUrl: './marquee.css',
})
export class Marquee {
  jobs = [
    {
      title:
        '📢 HR Executive – ABC Group hiring immediately in Dubai, UAE | Full-time | Salary AED 6,000 – 8,000 | Experience in recruitment & onboarding required | Apply today',
    },
    {
      title:
        '📢 Recruitment Specialist – XYZ HR Solutions urgently hiring for Abu Dhabi operations | Gulf recruitment experience preferred | Salary AED 8,000 – 10,000 plus benefits | Immediate joining',
    },
    {
      title:
        '📢 Talent Acquisition Officer – Global Manpower looking for proactive recruiters in Sharjah, UAE | AED 5,000 – 7,000 salary package | Source & screen candidates across multiple industries | Growth opportunities available',
    },
  ];

  currentIndex = 0;
  currentTitle = this.jobs[0].title;
  animate = true;
  intervalId: any;

  ngOnInit() {
    this.startTicker();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startTicker() {
    this.intervalId = setInterval(() => {
      this.animate = false;
      setTimeout(() => {
        this.currentIndex = (this.currentIndex + 1) % this.jobs.length;
        this.currentTitle = this.jobs[this.currentIndex].title;
        this.animate = true;
      }, 50);
    }, 18000);
  }
}
