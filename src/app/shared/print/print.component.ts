import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { PrintService } from './print.service';

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

  // Cached base64 images — loaded once and reused for all prints
  private _ayaDataUrl  = '';
  private _headDataUrl = '';

  constructor(
    public dialog: MatDialog,
    private _http: HttpClient,
    private _printService: PrintService
  ) {}

  closeDialog() { this.dialog.closeAll(); }

  doPrint(): void {
    if (this.pageFrom < 1)   this.pageFrom = 1;
    if (this.pageTo > 604)   this.pageTo = 604;
    if (this.pageTo < this.pageFrom) this.pageTo = this.pageFrom;

    const range = Array.from({ length: this.pageTo - this.pageFrom + 1 }, (_, i) => this.pageFrom + i);

    this.loading = true;

    // Preload images as base64 so they are embedded directly in the print HTML
    // (avoids cross-origin / base-href resolution failures in the new window)
    this._loadImages().then(() => this._buildPages(range));
  }

  private async _loadImages(): Promise<void> {
    if (this._ayaDataUrl && this._headDataUrl) return;
    const toDataUrl = async (path: string): Promise<string> => {
      try {
        const resp = await fetch(path);
        const blob = await resp.blob();
        return await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch { return ''; }
    };
    [this._ayaDataUrl, this._headDataUrl] = await Promise.all([
      toDataUrl('assets/images/aya.png'),
      toDataUrl('assets/images/head.png')
    ]);
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
      if (line.isSuraStart && line.segments?.[0]) {
        const suraNum = line.segments[0].verseKey.split(':')[0];
        const found = raw.ayas?.find((a: any) => String(a.suraNumber) === suraNum);
        suraName = found?.suraName || '';
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

  private _mergeSuras(moade3: any[]): string[] {
    const map = new Map<string, number[]>();
    (moade3 || []).forEach((item: any) => {
      const match = (item.suraWithIndex || '').match(/^(.*)\s*\((\d+)\)$/);
      if (!match) return;
      const sura = match[1].trim();
      const idx  = Number(match[2]);
      if (!map.has(sura)) map.set(sura, []);
      map.get(sura)!.push(idx);
    });
    return Array.from(map.entries()).map(([sura, idxs]) => {
      const sorted = [...new Set(idxs)].sort((a, b) => a - b);
      return `${sura} (${sorted.map(i => this._toArabic(i)).join('، ')})`;
    });
  }

  private _motashabehatBoxHtml(aya: any): string {
    if (!this.withMotashabehat) return '';
    const moade3 = aya?.motashabehat?.moade3;
    if (!moade3?.length) return '';
    const lines = this._mergeSuras(moade3);
    if (!lines.length) return '';
    // ONE box per aya — all sura references grouped inside, one per line
    return `<div class="mot-box">${lines.join('<br>')}</div>`;
  }

  // ── HTML builders ───────────────────────────────────────────────────────────

  private _buildHtml(range: number[], pages: any[]): string {
    const body = range.map(n => {
      const p = pages.find(pg => pg.pageNumber === n);
      return p ? this._pageHtml(p) : '';
    }).join('');

    // Use embedded base64 data URLs — no dependency on network or base-href in print window
    const ayaUrl = this._ayaDataUrl || '';

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>طباعة القرآن الكريم</title>
<link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style>
  /* Force background colors and images to print regardless of browser settings */
  * { box-sizing:border-box; margin:0; padding:0;
      -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body { font-family:'Amiri Quran','Amiri',serif; background:#fff; direction:rtl; }

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

  /* Sura header — head.png embedded as base64 with overlaid sura name */
  .sura-wrap {
    position:relative; text-align:center; margin:2mm 0 1mm;
    display:flex; align-items:center; justify-content:center;
  }
  .sura-head-img { width:100%; max-width:145mm; height:13mm; object-fit:fill; }
  .sura-name {
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    font-size:13.5pt; font-weight:bold; color:#2e4a2e;
    font-family:'Amiri',serif; white-space:nowrap; pointer-events:none;
  }

  /* 3-column table (RTL): [mot-right col1=RIGHT] [line col2=CENTER] [mot-left col3=LEFT] */
  .mushaf-table { width:100%; table-layout:fixed; border-collapse:collapse; flex:1; direction:rtl; }
  .sura-cell    { padding:0; }
  .line-cell    { vertical-align:middle; }
  .mot-cell     { width:26mm; vertical-align:middle; padding:0 1.5mm; text-align:center; }

  .line {
    width:100%; display:flex; flex-direction:row; justify-content:space-between;
    align-items:baseline; direction:rtl;
    line-height:2.1; font-size:14pt; color:#111;
  }
  .line.centered { justify-content:center; gap:5px; }
  .word { white-space:nowrap; }
  .word.colored {
    text-decoration:underline; text-decoration-thickness:2px; text-underline-offset:5px;
  }

  /* Aya ornament — aya.png embedded as base64 */
  .aya-mark {
    display:inline-flex; align-items:center; justify-content:center;
    width:24px; height:24px;
    background-image:url('${ayaUrl}');
    background-size:cover; background-position:center;
    font-size:8pt; font-family:'Amiri',serif; color:#3a6a3a;
    flex-shrink:0; margin:0 1px; vertical-align:middle;
  }

  /* ONE box per aya — all sura references inside, each on its own line */
  .mot-box {
    display:block; font-size:7pt; font-family:'Amiri',serif;
    color:#166534; background:#f0fdf4 !important; border:1px solid #bbf7d0;
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
    const headSrc = this._headDataUrl || '';

    for (const line of (page.mushafLines || [])) {

      // ── Sura header (spans all 3 columns) ──────────────────────────────────
      if (line.isSuraStart && line.suraName) {
        rowsHtml += `<tr><td colspan="3" class="sura-cell">
<div class="sura-wrap">
  <img class="sura-head-img" src="${headSrc}" alt="">
  <span class="sura-name">${line.suraName}</span>
</div>
</td></tr>`;
      }

      const hasRichWords = line.segments?.some((s: any) => s.lineColoredWords?.length > 0);

      if (hasRichWords) {
        // ── Rich path: colored words + aya ornaments + motashabehat ──────────
        let lineText  = '';
        let motRight  = ''; // aya starts in right half of line (_startsRight = true)
        let motLeft   = ''; // aya starts in left  half of line (_startsRight = false)

        for (const seg of line.segments) {
          for (const w of (seg.lineColoredWords || [])) {
            const style = w.color ? ` style="text-decoration-color:${w.color}"` : '';
            lineText += `<span class="word${w.color ? ' colored' : ''}"${style}>${w.word}</span>`;
          }
          if (seg.isAyaEnd && seg.aya) {
            lineText += `<span class="aya-mark">${this._toArabic(seg.aya.ayaNumber)}</span>`;
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
          (_: string, n: string) => `<span class="aya-mark">${this._toArabic(+n)}</span>`
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
