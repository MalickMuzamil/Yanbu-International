import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { SweetAlert } from './Services/SweetAlert';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
   styleUrls: ['./app.css'] 
})
export class App {
  protected readonly title = signal('yanbu');


  constructor(private swUpdate: SwUpdate , private alert: SweetAlert) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
        if (event.type === 'VERSION_READY') {
          const confirmReload = confirm('New version available. Load it?');
          if (confirmReload) {
            this.swUpdate.activateUpdate().then(() => document.location.reload());
          }
        }
      });
    }
  }
}
