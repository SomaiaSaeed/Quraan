import { Component, signal,computed } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isOpenMenu : boolean = false;
  title = 'tailwaind-components';

  OpenMenu(){
    this.isOpenMenu = !this.isOpenMenu
  }
}
