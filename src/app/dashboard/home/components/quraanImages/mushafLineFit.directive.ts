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
  /** A line is never left wider than its column — text spilling past the page
   *  frame is worse than slightly narrow glyphs — so the floor is only a last
   *  resort against a pathological line, not a comfort limit. */
  private static readonly MIN_SCALE = 0.55;
  /** Stretching further than this visibly distorts, so a short line stays short */
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

    // A centred line — a sura's closing line, the basmala, the enlarged opening
    // pages — keeps its own width, exactly as it sits in the book. It is still
    // compressed if it would otherwise run past the page.
    const centred =
      el.classList.contains("mushaf-line-centered") ||
      el.classList.contains("mushaf-line-basmala") ||
      !!el.closest(".mushaf-body-special");

    const available = el.parentElement?.clientWidth ?? 0;
    const natural = el.offsetWidth;   // width:max-content, and transform doesn't affect it
    if (!available || !natural) return;

    const needed = available / natural;
    if (centred && needed >= 1) {
      el.style.transform = "";
      return;
    }

    const scale = Math.min(
      Math.max(needed, MushafLineFitDirective.MIN_SCALE),
      centred ? 1 : MushafLineFitDirective.MAX_SCALE
    );
    el.style.transform = `scaleX(${scale.toFixed(4)})`;
  }
}
