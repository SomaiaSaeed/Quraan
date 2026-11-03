import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from "@angular/core";
import {
  IMAGES,
  InputItem,
  MotashabehatSpan,
} from "src/app/core/constants/quraanImages.constant";
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from "@angular/material/dialog";
import { MenuItem } from "primeng/api";
import { ContextMenu } from "primeng/contextmenu";
import { QuraanImagesComponent } from "./components/quraanImages/quraanImages.component";
import { AyaCompareDialogComponent } from "./components/aya-compare-dialog/aya-compare-dialog.component";
import { AyaCompareDialogResult, AyaCompareRef } from "src/app/core/models/aya-compare.model";
import { formatMoade3Entries } from "src/app/core/utils/motashabehat-format.util";

/** Width of each motashabehat column in px (box + gap) */
const COL_WIDTH = 134;
/** Max column index (col-span-2 ≈ 400px → 3 columns max) */
const MAX_COL_INDEX = 2;
/** Top padding offset to match tw-pt-5 on the Quran column */
const QURAN_TOP_OFFSET = 24;
/** Box vertical padding (top+bottom) + per-line font height (11px × 1.5 lh ≈ 17px) */
const BOX_PADDING_PX = 12;
const BOX_LINE_HEIGHT_PX = 17;
/** Bottom margin to keep boxes away from the container edge */
const BOX_BOTTOM_MARGIN = 6;
/** Clear space kept between two boxes stacked in the same column */
const BOX_GAP_PX = 6;

/** Which edge of the page a box sits against */
type Side = "right" | "left";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnDestroy {
  images: any[] = IMAGES;
  inputs: InputItem[] = [];
  rightMotashabehatSpans: any[] = [];
  leftMotashabehatSpans: any[] = [];
  currentPage = 1;
  get isRightPage(): boolean { return this.currentPage % 2 !== 0; }
  /** Width of left stack (pages read) — grows 4 → 28 px */
  get leftStackWidth(): number { return Math.round(4 + (this.currentPage / 604) * 24); }
  /** Width of right stack (pages remaining) — shrinks 28 → 4 px */
  get rightStackWidth(): number { return Math.round(4 + ((604 - this.currentPage) / 604) * 24); }

  @ViewChild("compareMenu") compareMenu!: ContextMenu;
  @ViewChild(QuraanImagesComponent) private _quraanImages!: QuraanImagesComponent;
  compareMenuItems: MenuItem[] = [];

  /** Real on-screen top of every mushaf line of the current page, measured after render */
  private _lineTops: number[] = [];
  /** Every box of the current page, before it is dealt out to the two side panels */
  private _boxes: any[] = [];
  /** Waits for the mushaf lines of a freshly opened page to be painted */
  private _lineWatcher?: MutationObserver;

  constructor(
    private _spinner: NgxSpinnerService,
    private _dialog: MatDialog,
    private _host: ElementRef<HTMLElement>,
    private _cdr: ChangeDetectorRef
  ) {}

  onAyaClick(aya: any) {
    this.leftMotashabehatSpans.forEach((mot) => {
      if (parseInt(mot.ayaId) === parseInt(aya.id)) mot.highlighted = aya.highlighted;
    });
    this.rightMotashabehatSpans.forEach((mot) => {
      if (parseInt(mot.ayaId) === parseInt(aya.id)) mot.highlighted = aya.highlighted;
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
    const lineIdx = inp._lineIdx ?? 0;
    // Measured line position is exact. The arithmetic fallback only runs before the
    // first measurement — it has to guess the leading, so it drifts a little further
    // down with every line, which is what pushed boxes below their aya.
    const measured = this._lineTops[lineIdx];
    const natural = measured ?? this._estimateLineTop(inp, lineIdx);
    const containerH = Math.max(600, window.innerHeight - 170);
    const boxH = this.estimateBoxHeight(inp);
    return Math.min(natural, containerH - boxH - BOX_BOTTOM_MARGIN);
  }

  private _estimateLineTop(inp: any, lineIdx: number): number {
    const extraTop = inp._extraTopPx ?? 0;
    const fontSize = Math.min(46, Math.max(14, (window.innerHeight - 190) / 27.75));
    return lineIdx * fontSize * 1.85 + extraTop + QURAN_TOP_OFFSET;
  }

  /** Reads where each mushaf line actually ended up, so boxes can sit level with their aya.
   *  Returns false while the lines are not on screen yet. */
  private _measureLineTops(): boolean {
    const host = this._host.nativeElement;
    // Boxes are absolutely positioned inside the side panel, so line offsets have to be
    // measured against that same origin — the panel starts above the bordered page.
    const panel = host.querySelector(".motashabehat-side") as HTMLElement | null;
    if (!panel) { this._lineTops = []; return false; }

    // Address the page by number: the previous page's lines stay in the carousel DOM
    // for a while, and measuring those puts every box at the wrong height.
    const page = host.querySelector(
      `.quran-page[data-page="${this.currentPage}"]`
    ) as HTMLElement | null;
    const lines = page ? Array.from(page.querySelectorAll(".mushaf-line")) : [];
    if (!lines.length) { this._lineTops = []; return false; }

    const originTop = panel.getBoundingClientRect().top;
    this._lineTops = lines.map(
      (l) => (l as HTMLElement).getBoundingClientRect().top - originTop
    );
    return true;
  }

  /**
   * The child emits before Angular paints the lines — and building them can take a
   * while — so watch for them to land instead of polling for a fixed number of frames.
   */
  private _placeOncePainted(): void {
    this._lineWatcher?.disconnect();

    const settle = () => {
      this.assignPlacement();
      this._cdr.detectChanges();
      this._spinner.hide("page-nav");
    };

    if (this._measureLineTops()) { settle(); return; }

    this._lineWatcher = new MutationObserver(() => {
      if (!this._measureLineTops()) return;
      this._lineWatcher?.disconnect();
      this._lineWatcher = undefined;
      settle();
    });
    this._lineWatcher.observe(this._host.nativeElement, { childList: true, subtree: true });

    // never leave the spinner up if the lines never arrive
    setTimeout(() => {
      if (!this._lineWatcher) return;
      this._lineWatcher.disconnect();
      this._lineWatcher = undefined;
      this._spinner.hide("page-nav");
    }, 8000);
  }

  ngOnDestroy(): void {
    this._lineWatcher?.disconnect();
  }

  /** The page number can land after the boxes do, so re-place once we know which page it is */
  onPageNumberChange(page: number): void {
    this.currentPage = page;
    if (this._boxes.length) this._placeOncePainted();
  }

  @HostListener("window:resize")
  onWindowResize(): void {
    if (this._measureLineTops()) this.assignPlacement();
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
    this._boxes = [];
    this._lineTops = [];   // belong to the previous page

    this.inputs.forEach((input) => {
      const moade3 = input?.motashabehat?.moade3;
      if (!moade3 || moade3.length === 0) return;

      const groups = formatMoade3Entries(moade3, input.activeAya);
      (input as any).mergedSuras = groups;
      (input as any).allMatches = groups.flatMap((g) => g.entries);
      this._boxes.push(input);
    });

    this.assignPlacement();          // provisional, from the estimate
    this._placeOncePainted();        // corrected against the real line positions
  }

  /**
   * Places each box beside its aya, preferring the side the aya starts on.
   * When that side is already taken at the same height the box moves to the other
   * side before a second column is opened — a free opposite side always reads
   * better than stacking two columns of references on one edge.
   */
  private assignPlacement(): void {
    const boxes = [...this._boxes].sort((a, b) => (a._lineIdx ?? 0) - (b._lineIdx ?? 0));

    this.rightMotashabehatSpans = [];
    this.leftMotashabehatSpans = [];

    // bottom-most y already used, per side and column
    const used: Record<Side, number[]> = { right: [], left: [] };

    boxes.forEach((inp) => {
      const top = this.getAyaTop(inp);
      const height = this.estimateBoxHeight(inp);
      const preferred: Side = inp._startsRight ? "right" : "left";
      const other: Side = preferred === "right" ? "left" : "right";

      let placed = false;
      for (let col = 0; col <= MAX_COL_INDEX && !placed; col++) {
        for (const side of [preferred, other]) {
          if ((used[side][col] ?? 0) <= top) {
            this._place(inp, side, col, top, height, used);
            placed = true;
            break;
          }
        }
      }
      // Everything is occupied — fall back to the preferred side's last column
      if (!placed) this._place(inp, preferred, MAX_COL_INDEX, top, height, used);
    });
  }

  private _place(
    inp: any, side: Side, col: number, top: number, height: number,
    used: Record<Side, number[]>
  ): void {
    inp._colIndex = col;
    used[side][col] = top + height + BOX_GAP_PX;
    // The first panel in the grid renders on the visual left, the last on the right
    (side === "right" ? this.leftMotashabehatSpans : this.rightMotashabehatSpans).push(inp);
  }

  onMotashabehatRightClick(
    event: MouseEvent,
    group: { entries: AyaCompareRef[] },
    inp: InputItem
  ): void {
    event.preventDefault();

    const current: AyaCompareRef = {
      suraName: inp.sura,
      ayaIndex: inp.activeAya,
      text: inp.aya,
    };
    const allTargets: AyaCompareRef[] = (inp as any).allMatches ?? [];

    this.compareMenuItems = [
      {
        label: "مقارنة مع الحالي",
        icon: "pi pi-eye",
        command: () => this.openCompareDialog(current, group.entries),
      },
      {
        label: "مقارنة مع الجميع",
        icon: "pi pi-list",
        command: () => this.openCompareDialog(current, allTargets),
      },
    ];
    this.compareMenu.show(event);
  }

  private openCompareDialog(current: AyaCompareRef, targets: AyaCompareRef[]): void {
    const dialogRef = this._dialog.open<AyaCompareDialogComponent, unknown, AyaCompareDialogResult>(
      AyaCompareDialogComponent,
      {
        width: "700px",
        panelClass: "popup-center",
        data: { current, targets },
      }
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.jumpTo?.suraIndex != null) {
        this._quraanImages.navigateToAya(result.jumpTo.suraIndex, result.jumpTo.ayaIndex);
      }
    });
  }

}
