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
onAyaClick(aya: any) {
  debugger
  this.leftMotashabehatSpans.forEach(mot => {
    if (mot.id === parseInt(aya.id)) {
        mot.highlighted = aya.highlighted;
    } 
   
});

this.rightMotashabehatSpans.forEach(mot => {
  if (mot.id === parseInt(aya.id)) {
    mot.highlighted = aya.highlighted;
} 
});

}
hasHighlight(inp: any): boolean {
  return inp.highlighted;
}

  onMotshbehatGenerated($event: InputItem[]) {
    this.inputs = $event;
    this.rightMotashabehatSpans = [];
    this.leftMotashabehatSpans = [];
  
    if ($event && $event.length > 0) {
      this.inputs.forEach((input) => {
        if (input.motashabehatSpans.length > 0) {
          input.motashabehatSpans.forEach((motabehat) => {
            if (motabehat.moade3 != null && motabehat.moade3 !== "") {
              let x = JSON.parse(JSON.stringify(motabehat));
  
              // Step 1: Split by `)` and filter out empty strings
              const parts = motabehat.moade3
                .split(")")
                .map(part => part.trim())
                .filter(part => part !== "");
  
              // Step 2: Group aya indexes by sura name
              const suraMap: { [sura: string]: number[] } = {};
  
              parts.forEach(part => {
                const [sura, ayaStr] = part.split("(");
                if (sura && ayaStr) {
                  const suraName = sura.trim();
                  const ayaNum = parseInt(ayaStr.trim(), 10);
                  if (!suraMap[suraName]) {
                    suraMap[suraName] = [];
                  }
                  suraMap[suraName].push(ayaNum);
                }
              });
  
              // Step 3: Reconstruct moade3 as array of "SuraName (1, 2, 3)"
              x.moade3 = Object.entries(suraMap).map(([sura, ayas]) => {
                return `${sura} (${ayas.join(", ")}`;
              });
  
              // Push to correct side
              if (motabehat.isRight) {
                this.rightMotashabehatSpans.push(x);
              } else {
                this.leftMotashabehatSpans.push(x);
              }
            }
          });
        }
      });
    }
  
    debugger;
  }
  
  images: any[] = IMAGES;
  inputs: InputItem[] = [];
  rightMotashabehatSpans: any[] = [];
  leftMotashabehatSpans: any[] = [];

  constructor() {}

  ngOnInit() {
  }

}

