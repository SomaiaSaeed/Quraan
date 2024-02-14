import { Component, Input } from '@angular/core';
import { IMAGES } from 'src/app/core/constants/quraanImages.constant';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  images: any[] = IMAGES;

  constructor() {}

  ngOnInit() {
  }

}

