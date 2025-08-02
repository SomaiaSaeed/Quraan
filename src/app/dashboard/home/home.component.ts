import { Component, Input } from '@angular/core';
import {
  IMAGES,
  InputItem,
  MotashabehatSpan,
} from "src/app/core/constants/quraanImages.constant";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  onMotshbehatGenerated($event: InputItem[]) {
    this.inputs = $event;
    this.rightMotashabehatSpans = [];
    this.leftMotashabehatSpans = [];

    if ($event != null && $event.length > 0) {
      this.inputs.forEach((input) => {
        if (input.motashabehatSpans.length > 0) {
          input.motashabehatSpans.forEach((motabehat) => {
            if(motabehat.moade3!=null&&motabehat.moade3!=""){
              debugger
              let x = JSON.parse(JSON.stringify(motabehat));
              x.moade3 = motabehat.moade3.split(')');
              if (x.moade3.length > 0 && x.moade3[x.moade3.length - 1] === '') {
                x.moade3.pop(); // Remove the last element if it is an empty string
              }
              if (motabehat.isRight) 
                this.rightMotashabehatSpans.push(x);
              else this.leftMotashabehatSpans.push(x);
            }
           
          });
        }
      });
    }
    debugger
  }
  images: any[] = IMAGES;
  inputs: InputItem[] = [];
  rightMotashabehatSpans: any[] = [];
  leftMotashabehatSpans: any[] = [];

  constructor() {}

  ngOnInit() {
  }

}

