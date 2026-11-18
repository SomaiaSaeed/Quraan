import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from "@angular/core";

/**
 * Fits a page's text block to the page. Two cases, one measurement.
 *
 * Shrinking — the page metrics size the glyph for fifteen lines, which is every
 * page in the book. A page that opens a sura also carries a banner, and a page
 * that opens three carries three; that is extra height the metrics know nothing
 * about, so the block ran past the bottom of the page and raised a scrollbar
 * (98 pages carry a banner; 19 of them overflow at any glyph size). Here the
 * block is measured and the glyph eased down until it fits.
 *
 * Growing — Al-Fatiha and the opening of Al-Baqarah carry seven lines instead of
 * fifteen, so at the ordinary size they left the lower half of the page blank.
 * The printed mushaf sets those two pages in a visibly larger script, and that is
 * what this reproduces — by measuring rather than by a fixed factor, since the
 * two pages do not hold the same amount of text: it grows until the first limit
 * is reached, the widest line touching the side of the page or the block filling
 * its height.
 *
 * It corrects from whatever is on screen rather than resetting and re-measuring,
 * so a late web font, or a line rebuilt after the first pass, simply converges on
 * the next pass instead of being missed.
 */
@Directive({ selector: "[mushafBodyFit]" })
export class MushafBodyFitDirective implements AfterViewInit, OnDestroy {
  /** Below this an ordinary page is better off with a scrollbar than unreadable */
  private static readonly MIN_SHRINK = 0.7;
  /** Past this the opening pages stop looking like the rest of the mushaf */
  private static readonly MAX_GROW = 1.9;
  /** Breathing room kept at the page edges (px) */
  private static readonly SIDE_SLACK = 6;
  private static readonly BOTTOM_SLACK = 10;
  /** Stop correcting once this close, or the two observers keep each other awake */
  private static readonly SETTLED_PX = 0.4;
  /** Corrections per settle cycle — three is plenty; this is the backstop */
  private static readonly MAX_PASSES = 6;

  private _pageResize?: ResizeObserver;
  private _selfResize?: ResizeObserver;
  private _lines?: MutationObserver;
  private _pending: ReturnType<typeof setTimeout> | number = 0;

  /** The glyph size the stylesheet asks for, captured before any override */
  private _baseFs = 0;
  /** Corrections made since the block last settled */
  private _passes = 0;
  /** Page height the base was captured at, so a scrollbar does not look like a resize */
  private _baseAtPageH = 0;

  constructor(private _el: ElementRef<HTMLElement>, private _zone: NgZone) {}

  ngAfterViewInit(): void {
    // pure layout work — keep it out of change detection
    this._zone.runOutsideAngular(() => {
      this._schedule();

      this._lines = new MutationObserver(() => this._schedule());
      this._lines.observe(this._el.nativeElement, { childList: true, subtree: true });

      if (typeof ResizeObserver === "undefined") return;

      // The page box changed (window resize): the stylesheet's own glyph size
      // moved with it, so drop what we applied and take the new one as the base.
      const page = this._el.nativeElement.parentElement;
      if (page) {
        this._pageResize = new ResizeObserver(() => {
          // Only a real change of page height means a new base. Applying a glyph
          // size can add or remove the page's own scrollbar, which fires this
          // observer too — resetting on that would undo the fit on every pass.
          if (Math.abs(page.clientHeight - this._baseAtPageH) > 4) {
            this._el.nativeElement.style.removeProperty("--mushaf-fs");
            this._baseFs = 0;
          }
          this._schedule();
        });
        this._pageResize.observe(page);
      }

      // Our own height changed — a line rebuilt, the mushaf font finally loaded,
      // or our last correction landed. Re-check; it converges in a pass or two.
      this._selfResize = new ResizeObserver(() => this._schedule());
      this._selfResize.observe(this._el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this._pageResize?.disconnect();
    this._selfResize?.disconnect();
    this._lines?.disconnect();
    clearTimeout(this._pending);
  }

  /** Lines arrive one change-detection pass at a time; measure once they settle.
   *  A timer rather than an animation frame: frames stop being served while the
   *  tab is in the background, and a page laid out there would stay unfitted
   *  until something else happened to nudge it. */
  private _schedule(): void {
    clearTimeout(this._pending);
    this._pending = setTimeout(() => this._fit(), 0) as unknown as number;
  }

  private _fit(): void {
    const el = this._el.nativeElement;
    const page = el.parentElement;
    if (!page) return;

    const lines = Array.from(el.querySelectorAll<HTMLElement>(".mushaf-line"));
    if (!lines.length) return;

    const probe = lines[0].querySelector("span");
    const currentFs = probe ? parseFloat(getComputedStyle(probe).fontSize) : 0;
    if (!currentFs) return;
    if (!this._baseFs) {
      this._baseFs = currentFs;                    // nothing applied yet
      this._baseAtPageH = page.clientHeight;
    }

    // A sura banner is a fixed height, so it does not scale with the glyph —
    // take it out of the budget rather than scaling it. Margins count: summing
    // the children's boxes left the banners' own margins out and the first
    // correction landed a dozen pixels short.
    const outerHeight = (c: HTMLElement) => {
      const cs = getComputedStyle(c);
      return c.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    };
    const children = Array.from(el.children) as HTMLElement[];
    const fixedHeight = children
      .filter((c) => c.classList.contains("sura-header"))
      .reduce((sum, c) => sum + outerHeight(c), 0);
    // The children's own heights, not the box they sit in: the opening pages are
    // stretched to the full page by a min-height, so scrollHeight there measures
    // the page rather than the text.
    const contentHeight = children.reduce((sum, c) => sum + outerHeight(c), 0);
    const textHeight = contentHeight - fixedHeight;
    if (textHeight <= 0) return;

    const availableWidth = el.clientWidth - MushafBodyFitDirective.SIDE_SLACK;
    const availableHeight =
      page.clientHeight - el.offsetTop - MushafBodyFitDirective.BOTTOM_SLACK;
    if (availableWidth <= 0 || availableHeight <= 0) return;

    const heightRatio = (availableHeight - fixedHeight) / textHeight;

    // Only the opening pages are width-bound: everywhere else a long line is
    // fitted sideways by [mushafLineFit] — the kashida the book itself uses —
    // and shrinking a whole page over one long line would be wrong.
    const isOpeningPage = el.classList.contains("mushaf-body-special");
    const widthRatio = isOpeningPage
      ? availableWidth / Math.max(...lines.map((l) => l.offsetWidth))
      : Number.POSITIVE_INFINITY;

    const ceiling =
      this._baseFs * (isOpeningPage ? MushafBodyFitDirective.MAX_GROW : 1);
    const floor = this._baseFs * MushafBodyFitDirective.MIN_SHRINK;

    const target = Math.min(
      Math.max(currentFs * Math.min(heightRatio, widthRatio), floor),
      ceiling
    );

    if (Math.abs(target - currentFs) < MushafBodyFitDirective.SETTLED_PX) {
      this._passes = 0;
      return;
    }

    el.style.setProperty("--mushaf-fs", `${target.toFixed(2)}px`);

    // Part of the block does not scale with the glyph — a banner, the margins
    // around it — so one correction gets close rather than exact. Check again;
    // the deadband above ends it, and the counter ends it even if it cannot
    // settle (a page it simply cannot fit stops at MIN_SHRINK).
    if (++this._passes < MushafBodyFitDirective.MAX_PASSES) this._schedule();
    else this._passes = 0;
  }
}
