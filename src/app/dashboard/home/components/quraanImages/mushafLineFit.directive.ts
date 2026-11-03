import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from "@angular/core";

/**
 * Stretches (or slightly compresses) a mushaf line so it exactly fills the column —
 * the job kashida elongation does on a printed mushaf page.
 *
 * Without it the line keeps its natural text width and the leftover column space is
 * dumped between the words, which is what makes ayat read as separated words.
 * Centred lines — sura headers, basmala, the short closing line of a sura — are left
 * alone, exactly as they sit in the book.
 */
@Directive({ selector: "[mushafLineFit]" })
export class MushafLineFitDirective implements AfterViewInit, OnDestroy {
  /** Beyond these the glyphs visibly distort, so a line is left short instead */
  private static readonly MIN_SCALE = 0.78;
  private static readonly MAX_SCALE = 1.18;

  private _observer?: ResizeObserver;

  constructor(private _el: ElementRef<HTMLElement>, private _zone: NgZone) {}

  ngAfterViewInit(): void {
    // pure layout work — keep it out of change detection
    this._zone.runOutsideAngular(() => {
      this._fit();
      if (typeof ResizeObserver === "undefined") return;
      this._observer = new ResizeObserver(() => this._fit());
      this._observer.observe(this._el.nativeElement);           // font size changed
      const parent = this._el.nativeElement.parentElement;
      if (parent) this._observer.observe(parent);               // column width changed
    });
  }

  ngOnDestroy(): void {
    this._observer?.disconnect();
  }

  private _fit(): void {
    const el = this._el.nativeElement;

    if (
      el.classList.contains("mushaf-line-centered") ||
      el.classList.contains("mushaf-line-basmala") ||
      el.closest(".mushaf-body-special")
    ) {
      el.style.transform = "";
      return;
    }

    const available = el.parentElement?.clientWidth ?? 0;
    const natural = el.offsetWidth;   // width:max-content, and transform doesn't affect it
    if (!available || !natural) return;

    const scale = Math.min(
      Math.max(available / natural, MushafLineFitDirective.MIN_SCALE),
      MushafLineFitDirective.MAX_SCALE
    );
    el.style.transform = `scaleX(${scale.toFixed(4)})`;
  }
}
