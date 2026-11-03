import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { PrintService } from './print.service';
import { Search } from 'src/app/core/services/search.service';
import { formatMoade3Entries } from 'src/app/core/utils/motashabehat-format.util';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent {
  pageFrom = 1;
  pageTo   = 1;
  loading  = false;
  withMotashabehat = true;

  // Cached base64 Quran font — loaded once and reused for all prints, so the print
  // window (a separate document) renders the same script as the live mushaf page
  private _fontDataUrl = '';

  // sura index → total aya count, for the sura-header banner (mirrors QuraanImagesComponent.suraList)
  private _suraAyaCounts: Map<number, number> | null = null;

  constructor(
    public dialog: MatDialog,
    private _http: HttpClient,
    private _printService: PrintService,
    private _searchInstance: Search
  ) {}

  closeDialog() { this.dialog.closeAll(); }

  doPrint(): void {
    if (this.pageFrom < 1)   this.pageFrom = 1;
    if (this.pageTo > 604)   this.pageTo = 604;
    if (this.pageTo < this.pageFrom) this.pageTo = this.pageFrom;

    const range = Array.from({ length: this.pageTo - this.pageFrom + 1 }, (_, i) => this.pageFrom + i);

    this.loading = true;

    // Preload the Quran font as base64 so it's embedded directly in the print HTML
    // (avoids cross-origin / base-href resolution failures in the new window)
    this._loadAssets().then(() => this._buildPages(range));
  }

  private async _loadAssets(): Promise<void> {
    if (!this._fontDataUrl) {
      try {
        const resp = await fetch('assets/fonts/uthmanic_hafs_v20.ttf');
        const blob = await resp.blob();
        this._fontDataUrl = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch { /* falls back to the Amiri Quran web font already linked in the print doc */ }
    }
  }

  /** sura index → aya count, built once from the same table_othmani rows QuraanImagesComponent uses */
  private _getSuraAyaCounts(): Map<number, number> {
    if (!this._suraAyaCounts) {
      const counts = new Map<number, number>();
      this._searchInstance.table_othmani.forEach((row: any) => {
        const n = Number(row.nOFSura);
        counts.set(n, (counts.get(n) ?? 0) + 1);
      });
      this._suraAyaCounts = counts;
    }
    return this._suraAyaCounts;
  }

  private _buildPages(range: number[]): void {
    const loaded: any[]     = [];
    const toFetch: number[] = [];

    range.forEach(n => {
      const p = this._printService.quranPages.find((pg: any) => pg.pageNumber === n);
      if (p?.mushafLines?.length) loaded.push(p);
      else toFetch.push(n);
    });

    if (!toFetch.length) {
      this.loading = false;
      this._render(range, loaded);
      return;
    }

    forkJoin(toFetch.map(n => this._http.get<any>(`assets/jsonData/mushaf-lines/page-${n}.json`))).subscribe({
      next: fetched => {
        this.loading = false;
        const converted = fetched.map(raw => {
          // Pass the slide so _convertRaw can attach aya motashabehat + _startsRight
          const slide = this._printService.quranPages.find((pg: any) => pg.pageNumber === raw.pageNumber);
          return this._convertRaw(raw, slide);
        });
        const all = [...loaded, ...converted].sort((a, b) => a.pageNumber - b.pageNumber);
        this._render(range, all);
      },
      error: () => { this.loading = false; }
    });
  }

  private _convertRaw(raw: any, slide?: any): any {
    // Build aya lookup from slide data: sura:aya → aya object (has motashabehat, _startsRight)
    const ayaLookup = new Map<string, any>();
    (slide?.ayat || []).forEach((aya: any) => {
      ayaLookup.set(`${aya.suraNumber}:${aya.ayaNumber}`, aya);
    });

    const mushafLines = (raw.lines || []).map((line: any) => {
      let suraName = '';
      let suraNumber = 0;
      let suraAyaCount = 0;
      if (line.isSuraStart && line.segments?.[0]) {
        suraNumber = Number(line.segments[0].verseKey.split(':')[0]);
        const found = raw.ayas?.find((a: any) => a.suraNumber === suraNumber);
        suraName = found?.suraName || '';
        suraAyaCount = this._getSuraAyaCounts().get(suraNumber) ?? 0;
      }

      // Build minimal segments: aya reference + isAyaEnd only (empty lineColoredWords).
      // lineText is still used for word rendering; segments are used ONLY for mot boxes.
      const lastForVerse = new Map<string, number>();
      (line.segments || []).forEach((seg: any, i: number) => lastForVerse.set(seg.verseKey, i));

      const segments = (line.segments || [])
        .map((seg: any, i: number) => ({
          aya: ayaLookup.get(seg.verseKey) || null,
          lineColoredWords: [],
          isAyaEnd: lastForVerse.get(seg.verseKey) === i
        }))
        .filter((seg: any) => seg.isAyaEnd && seg.aya?.motashabehat); // only end-of-aya with mot data

      return {
        isCentered: !!(line.isSuraStart || line.isBasmala),
        isSuraStart: !!line.isSuraStart,
        isBasmala:   !!line.isBasmala,
        suraName,
        suraNumber,
        suraAyaCount,
        lineText: line.text,
        segments // empty lineColoredWords → lineText path used for words; segments for mot
      };
    });
    return { pageNumber: raw.pageNumber, mushafLines };
  }

  private _render(range: number[], pages: any[]): void {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(this._buildHtml(range, pages));
    win.document.close();
    setTimeout(() => win.print(), 1200);
  }

  // ── Motashabehat helpers ────────────────────────────────────────────────────

  private _motashabehatBoxHtml(aya: any): string {
    if (!this.withMotashabehat) return '';
    const moade3 = aya?.motashabehat?.moade3;
    if (!moade3?.length) return '';
    // Same grouping as the live mushaf boxes: sorted by match strength then mushaf
    // order upstream, consecutive same-sura runs share one set of brackets.
    const groups = formatMoade3Entries(moade3);
    if (!groups.length) return '';
    // ONE box per aya — all sura references grouped inside, one per line
    return `<div class="mot-box">${groups.map(g => g.text).join('<br>')}</div>`;
  }

  /**
   * Sets aya._startsRight for every aya on the page, from the page's own mushafLines —
   * independent of whether the page was ever rendered live. Without this, unvisited
   * pages have _startsRight === undefined on every aya, which the render loop below
   * treats as "right" for everything (see _pageHtml), pushing all boxes to one side.
   * Same word-position logic as QuraanImagesComponent.buildMushafLinesForCurrentPage.
   */
  private _applyStartsRight(page: any): void {
    const ayaStartsRight = new Map<string, boolean>();
    const segWordCount = (seg: any): number =>
      (seg.lineGroups || []).reduce((s: number, g: any) => s + (g.words?.length ?? 0), 0) || 1;

    (page.mushafLines || []).forEach((ml: any) => {
      const totalWords = (ml.segments || []).reduce((sum: number, seg: any) => sum + segWordCount(seg), 0);
      let wordsBefore = 0;
      (ml.segments || []).forEach((seg: any) => {
        const id = seg.aya?.id?.toString();
        if (id && !ayaStartsRight.has(id)) {
          ayaStartsRight.set(id, totalWords === 0 || wordsBefore / totalWords < 0.5);
        }
        wordsBefore += segWordCount(seg);
      });
    });

    (page.mushafLines || []).forEach((ml: any) => {
      (ml.segments || []).forEach((seg: any) => {
        const id = seg.aya?.id?.toString();
        if (id && ayaStartsRight.has(id)) seg.aya._startsRight = ayaStartsRight.get(id);
      });
    });
  }

  // ── HTML builders ───────────────────────────────────────────────────────────

  private _buildHtml(range: number[], pages: any[]): string {
    const body = range.map(n => {
      const p = pages.find(pg => pg.pageNumber === n);
      if (p) this._applyStartsRight(p);
      return p ? this._pageHtml(p) : '';
    }).join('');

    // Same Uthmanic Hafs font the live mushaf page uses, embedded so the print
    // window (a separate document) doesn't depend on the app's base-href/assets
    const fontFace = this._fontDataUrl
      ? `@font-face {
    font-family:'uthmanic_hafs_v20';
    src:url('${this._fontDataUrl}') format('truetype');
    font-style:normal; font-display:block;
  }`
      : '';

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>طباعة القرآن الكريم</title>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style>
  /* Force background colors and images to print regardless of browser settings */
  * { box-sizing:border-box; margin:0; padding:0;
      -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  ${fontFace}
  body { font-family:'Amiri',serif; background:#fff; direction:rtl; }

  /* Page frame — matches the live mushaf's tw-border-4 tw-border-[#e4e4d0] tw-border-double tw-bg-[#fdf9ee] */
  .page {
    width:200mm; margin:6mm auto; padding:7mm 5mm 5mm;
    background:#fdf9ee !important; border:4px double #e4e4d0;
    display:flex; flex-direction:column;
    page-break-after:always;
  }
  .page-header {
    display:flex; justify-content:space-between; align-items:center;
    margin-bottom:3mm; padding-bottom:2mm; border-bottom:1.5px solid #94A684;
    font-size:9pt; color:#5a7a5a; font-family:'Amiri',serif;
  }

  /* Sura header — gold banner, matches .sura-header__* on the live mushaf page */
  .sura-header {
    display:flex; align-items:stretch; height:11mm; margin:2mm 0 1mm;
    border:1.5px solid #c9a052; border-radius:1mm; overflow:hidden;
    background:linear-gradient(180deg, #fdf5e0 0%, #f5e3b0 45%, #fdf5e0 100%);
    box-shadow:0 1px 3px rgba(139,90,20,0.12);
  }
  .sura-header__side {
    display:flex; align-items:center; justify-content:center;
    width:11mm; min-width:11mm;
    background:linear-gradient(180deg, #e8c97a 0%, #c9a052 50%, #e8c97a 100%);
  }
  .sura-header__side--right { border-left:1px solid #c9a052; order:1; }
  .sura-header__side--left  { border-right:1px solid #c9a052; order:3; }
  .sura-header__num-badge {
    width:8mm; height:8mm; border-radius:50%;
    background:linear-gradient(135deg, #fff8e8, #f0d080);
    border:1px solid rgba(255,255,255,0.7);
    display:inline-flex; align-items:center; justify-content:center;
    font-size:8pt; font-weight:800; font-family:'Amiri',serif; color:#5c3a0e;
  }
  .sura-header__count-badge {
    text-align:center; font-family:'Amiri',serif; color:#4a2c06; line-height:1.2;
  }
  .sura-header__count-badge b { display:block; font-size:9pt; font-weight:800; }
  .sura-header__count-badge small { display:block; font-size:6pt; font-weight:600; }
  .sura-header__center {
    flex:1; order:2; display:flex; align-items:center; justify-content:center;
    gap:6px; padding:0 4mm;
  }
  .sura-header__name {
    font-family:'uthmanic_hafs_v20','Amiri',serif; font-size:15pt; font-weight:700;
    color:#2c1a06; letter-spacing:2px;
  }
  .sura-header__gem { font-size:8pt; color:#a07828; }

  /* 3-column table (RTL): [mot-right col1=RIGHT] [line col2=CENTER] [mot-left col3=LEFT] */
  .mushaf-table { width:100%; table-layout:fixed; border-collapse:collapse; flex:1; direction:rtl; }
  .sura-cell    { padding:0; }
  .line-cell    { vertical-align:middle; }
  .mot-cell     { width:26mm; vertical-align:middle; padding:0 1.5mm; text-align:center; }

  /* Full-width justified lines, matching .mushaf-line (space-evenly, not space-between —
     space-between stretches huge gaps across short lines) */
  .line {
    width:100%; display:flex; flex-direction:row; flex-wrap:nowrap; justify-content:space-evenly;
    align-items:baseline; direction:rtl; padding:0 4px;
    line-height:1.6; font-size:14pt; color:#111; font-family:'uthmanic_hafs_v20','Amiri',serif;
  }
  .line.centered { justify-content:center; gap:10px; }
  .word { white-space:nowrap; }
  .word.colored {
    text-decoration:underline; text-decoration-thickness:2px; text-underline-offset:5px;
  }

  /* Aya-end number — matches .aya-aya on the live mushaf page (plain number, no ornament) */
  .aya-aya {
    display:inline-flex; align-items:center; justify-content:center;
    font-size:8pt; font-weight:600; font-family:'Amiri',serif; color:#7a5a1e;
    flex-shrink:0; margin:0 2px; vertical-align:middle;
  }

  /* ONE box per aya — all sura references inside, each on its own line.
     Colors match .motashabehat-box / tw-text-green-700 on the live mushaf page. */
  .mot-box {
    display:block; font-size:7pt; font-family:'Amiri',serif;
    color:#15803d; background:#f0fdf4 !important; border:1px solid #bbf7d0;
    border-radius:8px; padding:3px 5px; margin:2px auto;
    line-height:1.5; text-align:center; word-break:break-word;
    max-width:24mm;
  }

  .page-footer {
    text-align:center; margin-top:4mm; padding-top:2mm;
    border-top:1.5px solid #94A684; font-size:9pt;
    color:#5a7a5a; font-family:'Amiri',serif;
  }
  @media print {
    body { margin:0; }
    .page {
      border:4px double #e4e4d0; margin:0; padding:5mm 4mm;
      width:100%; min-height:100vh; background:#fdf9ee !important;
    }
    @page { size:A4; margin:3mm; }
  }
</style>
</head>
<body>${body}</body>
</html>`;
  }

  private _pageHtml(page: any): string {
    let rowsHtml = '';

    for (const line of (page.mushafLines || [])) {

      // ── Sura header (spans all 3 columns) ──────────────────────────────────
      if (line.isSuraStart && line.suraName) {
        rowsHtml += `<tr><td colspan="3" class="sura-cell">
<div class="sura-header">
  <span class="sura-header__side sura-header__side--right">
    <span class="sura-header__num-badge">${this._toArabic(line.suraNumber)}</span>
  </span>
  <span class="sura-header__center">
    <span class="sura-header__gem">✦</span>
    <span class="sura-header__name">${line.suraName}</span>
    <span class="sura-header__gem">✦</span>
  </span>
  <span class="sura-header__side sura-header__side--left">
    <span class="sura-header__count-badge"><b>${this._toArabic(line.suraAyaCount)}</b><small>آيات</small></span>
  </span>
</div>
</td></tr>`;
      }

      const hasRichWords = line.segments?.some((s: any) =>
        s.lineColoredWords?.length > 0 || s.lineGroups?.length > 0
      );

      if (hasRichWords) {
        // ── Rich path: colored words + aya ornaments + motashabehat ──────────
        let lineText  = '';
        let motRight  = ''; // aya starts in right half of line (_startsRight = true)
        let motLeft   = ''; // aya starts in left  half of line (_startsRight = false)

        for (const seg of line.segments) {
          // Handle lineColoredWords format (print-converted pages)
          if (seg.lineColoredWords?.length) {
            for (const w of seg.lineColoredWords) {
              const style = w.color ? ` style="text-decoration-color:${w.color}"` : '';
              lineText += `<span class="word${w.color ? ' colored' : ''}"${style}>${w.word}</span>`;
            }
          }
          // Handle lineGroups format (pages loaded from main carousel)
          else if (seg.lineGroups?.length) {
            for (const g of seg.lineGroups) {
              for (const word of (g.words || [])) {
                const style = g.color ? ` style="text-decoration-color:${g.color}"` : '';
                lineText += `<span class="word${g.color ? ' colored' : ''}"${style}>${word}</span>`;
              }
            }
          }
          if (seg.isAyaEnd && seg.aya) {
            lineText += `<span class="aya-aya">${this._toArabic(seg.aya.ayaNumber)}</span>`;
            const motHtml = this._motashabehatBoxHtml(seg.aya);
            if (seg.aya._startsRight === false) motLeft  += motHtml;
            else                                motRight += motHtml;
          }
        }

        const cls = line.isCentered ? 'line centered' : 'line';
        // RTL column order: [mot-right=col1→RIGHT] [line=col2→CENTER] [mot-left=col3→LEFT]
        rowsHtml += `<tr>
<td class="mot-cell">${motRight}</td>
<td class="line-cell"><div class="${cls}">${lineText}</div></td>
<td class="mot-cell">${motLeft}</td>
</tr>`;

      } else {
        // ── Fallback path: lineText for words, segments only for mot boxes ───
        const cls    = line.isCentered ? 'line centered' : 'line';
        const styled = (line.lineText || '').replace(/﴿(\d+)﴾/g,
          (_: string, n: string) => `<span class="aya-aya">${this._toArabic(+n)}</span>`
        );

        let motRight = '';
        let motLeft  = '';
        for (const seg of (line.segments || [])) {
          if (seg.isAyaEnd && seg.aya) {
            const motHtml = this._motashabehatBoxHtml(seg.aya);
            if (seg.aya._startsRight === false) motLeft  += motHtml;
            else                                motRight += motHtml;
          }
        }

        rowsHtml += `<tr>
<td class="mot-cell">${motRight}</td>
<td class="line-cell"><div class="${cls}">${styled}</div></td>
<td class="mot-cell">${motLeft}</td>
</tr>`;
      }
    }

    return `
<div class="page">
  <div class="page-header">
    <span>القرآن الكريم</span>
    <span>صفحة ${this._toArabic(page.pageNumber)}</span>
  </div>
  <table class="mushaf-table"><tbody>${rowsHtml}</tbody></table>
  <div class="page-footer">— ${this._toArabic(page.pageNumber)} —</div>
</div>`;
  }

  private _toArabic(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }
}
