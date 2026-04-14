import { Component, Input } from "@angular/core";
import {
  IMAGES,
  InputItem,
  MotashabehatSpan,
} from "src/app/core/constants/quraanImages.constant";

/** Width of each motashabehat column in px (box + gap) */
const COL_WIDTH = 134;
/** Max column index (col-span-2 ≈ 400px → 3 columns max) */
const MAX_COL_INDEX = 2;
/** Rendered pixel height per mushaf line: font-size 24px × line-height 2.1 */
const LINE_HEIGHT_PX = 50;
/** Top padding offset to match tw-pt-5 on the Quran column */
const QURAN_TOP_OFFSET = 24;
/** Box vertical padding (top+bottom) + per-line font height (11px × 1.5 lh ≈ 17px) */
const BOX_PADDING_PX = 12;
const BOX_LINE_HEIGHT_PX = 17;
/** Bottom margin to keep boxes away from the container edge */
const BOX_BOTTOM_MARGIN = 6;

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
    this.leftMotashabehatSpans.forEach((mot) => {
      if (mot.id === parseInt(aya.id)) mot.highlighted = aya.highlighted;
    });
    this.rightMotashabehatSpans.forEach((mot) => {
      if (mot.id === parseInt(aya.id)) mot.highlighted = aya.highlighted;
    });
  }

  hasHighlight(inp: any): boolean {
    return inp.highlighted;
  }

  /** Returns horizontal offset (px) for a given column index */
  getColOffset(inp: any): number {
    return (inp._colIndex ?? 0) * COL_WIDTH;
  }

  /** Returns the pixel top of an aya aligned to the actual rendered mushaf line,
   *  clamped so the box never overflows the container bottom. */
  getAyaTop(inp: any): number {
    const lineIdx  = inp._lineIdx  ?? 0;
    const extraTop = inp._extraTopPx ?? 0;
    const natural  = lineIdx * LINE_HEIGHT_PX + extraTop + QURAN_TOP_OFFSET;
    const containerH = Math.max(600, window.innerHeight - 220);
    const boxH = this.estimateBoxHeight(inp);
    return Math.min(natural, containerH - boxH - BOX_BOTTOM_MARGIN);
  }

  /** Estimated rendered height of a motashabehat box in px */
  private estimateBoxHeight(inp: any): number {
    const lines = inp.mergedSuras?.length ?? 1;
    return BOX_PADDING_PX + lines * BOX_LINE_HEIGHT_PX;
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

      // _startsRight=true → aya begins at the right edge → box goes to right panel
      if ((input as any)._startsRight) {
        this.leftMotashabehatSpans.push(input);   // right panel (last col-span-2)
      } else {
        this.rightMotashabehatSpans.push(input);  // left panel (first col-span-2)
      }
    });

    this.assignColumns(this.rightMotashabehatSpans);
    this.assignColumns(this.leftMotashabehatSpans);
  }

  private assignColumns(spans: any[]): void {
    const colBottoms: number[] = [];
    const sorted = [...spans].sort((a, b) => (a._lineIdx ?? 0) - (b._lineIdx ?? 0));

    sorted.forEach((inp) => {
      const top = this.getAyaTop(inp);
      // Find first column with enough space for this box
      let ci = colBottoms.findIndex((bottom) => bottom <= top);

      if (ci === -1) {
        // No existing column has space — open the next one, capped at MAX_COL_INDEX
        ci = Math.min(colBottoms.length, MAX_COL_INDEX);
      }
      if (colBottoms[ci] === undefined) colBottoms[ci] = 0;
      inp._colIndex = ci;
      colBottoms[ci] = top + this.estimateBoxHeight(inp);
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

      if (!map.has(suraName)) map.set(suraName, []);
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
