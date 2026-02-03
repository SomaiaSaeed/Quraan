import { Component, Input } from "@angular/core";
import {
  IMAGES,
  InputItem,
  MotashabehatSpan,
} from "src/app/core/constants/quraanImages.constant";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  images: any[] = IMAGES;
  inputs: InputItem[] = [];
  rightMotashabehatSpans: any[] = [];
  leftMotashabehatSpans: any[] = [];

  constructor() {}
  onAyaClick(aya: any) {
    ;
    this.leftMotashabehatSpans.forEach((mot) => {
      if (mot.id === parseInt(aya.id)) {
        mot.highlighted = aya.highlighted;
      }
    });

    this.rightMotashabehatSpans.forEach((mot) => {
      if (mot.id === parseInt(aya.id)) {
        mot.highlighted = aya.highlighted;
      }
    });
  }
  hasHighlight(inp: any): boolean {
    return inp.highlighted;
  }

  onMotshbehatGenerated($event: InputItem[]) {
    this.inputs = $event ?? [];
    this.rightMotashabehatSpans = [];
    this.leftMotashabehatSpans = [];

    this.inputs.forEach((input) => {
      const moade3 = input?.motashabehat?.moade3;
      if (!moade3 || moade3.length === 0) return;

      (input as any).mergedSuras = this.mergeSuraWithIndexes(
        moade3,
        input.activeAya
      );

      if (input.motashabehat.isRight) {
        this.rightMotashabehatSpans.push(input);
      } else {
        this.leftMotashabehatSpans.push(input);
      }
      
    });
  }

  private mergeSuraWithIndexes(
    moade3List: any[],
    activeAya?: number
  ): { text: string; highlighted: boolean }[] {
    const map = new Map<string, number[]>();

    moade3List.forEach((item) => {
      const match = item.suraWithIndex.match(/^(.*)\s*\((\d+)\)$/);
      if (!match) return;

      const suraName = match[1].trim();
      const index = Number(match[2]);

      if (!map.has(suraName)) {
        map.set(suraName, []);
      }
      map.get(suraName)!.push(index);
    });

    return Array.from(map.entries()).map(([sura, indexes]) => {
      const sorted = [...new Set(indexes)].sort((a, b) => a - b);

      const arabicIndexes = sorted
        .map((i) => this.toArabicNumber(i))
        .join("، ");

      return {
        text: `${sura} (${arabicIndexes})`,
        highlighted: activeAya ? sorted.includes(activeAya) : false,
      };
    });
  }

  private toArabicNumber(num: number): string {
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .split("")
      .map((d) => arabicDigits[+d])
      .join("");
  }
}
