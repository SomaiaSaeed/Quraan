import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataSharingService, ALL_COLUMNS, ColumnDef } from '../../services/data-sharing.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArabicNormalizerService } from 'src/app/core/services/arabic-normalizer.service';

interface SuraGroup {
  name: string;
  suraNum: number;
  items: any[];
}

@Component({
  selector: 'app-search-table',
  templateUrl: './search-table.component.html',
  styleUrls: ['./search-table.component.scss']
})
export class SearchTableComponent implements OnInit {
  selectedData?: { data: any[] };
  searchQuery: string = '';
  originalData: any[] = [];

  // ── filter state ──────────────────────────────────────────────────────────
  contentMode: string = 'quranGeneral';
  suraOrder: string   = 'mushafOrder';
  suraFilter: string  = '';
  suraOptions: string[] = [];

  // ── columns ───────────────────────────────────────────────────────────────
  visibleColumns: ColumnDef[] = [];

  // ── inner search ──────────────────────────────────────────────────────────
  innerQuery: string = '';

  // ── view mode ─────────────────────────────────────────────────────────────
  viewMode: 'flat' | 'grouped' = 'flat';

  // ── pagination ────────────────────────────────────────────────────────────
  pageSize: number = 20;
  currentPage: number = 1;
  readonly pageSizeOptions = [20, 50, 100, 200];

  // ── grouped view ──────────────────────────────────────────────────────────
  collapsedSuras = new Set<string>();

  // ── internal display cache ────────────────────────────────────────────────
  private _displayData: any[] = [];

  constructor(
    private dataSharingService: DataSharingService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private router: Router,
    private normalizer: ArabicNormalizerService   // Issue 9 – shared normaliser
  ) {}

  ngOnInit(): void {
    this.dataSharingService.selectedData$.subscribe(combinedData => {
      this.selectedData = combinedData;
      this.originalData = [...this.selectedData.data];
      this.searchQuery  = combinedData.searchQuery;

      const suraMap = new Map<string, number>();
      this.originalData.forEach(item => {
        const name = item.data?.Sura_Name;
        const num  = parseInt(item.data?.nOFSura ?? '0', 10);  // Bug 7 – radix + null guard
        if (name && !suraMap.has(name)) suraMap.set(name, num);
      });
      this.suraOptions = Array.from(suraMap.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([name]) => name);

      this.contentMode = 'quranGeneral';
      this.suraOrder   = 'mushafOrder';
      this.suraFilter  = '';
      this.innerQuery  = '';
      this.currentPage = 1;
      this.collapsedSuras.clear();
      this.applyFilters();
    });

    this.dataSharingService.selectedColumns$.subscribe(keys => {
      this.visibleColumns = ALL_COLUMNS.filter(c => keys.includes(c.key));
      this.cdr.detectChanges();
    });
  }

  // ── event handlers ─────────────────────────────────────────────────────────

  onContentModeChange(event: any): void {
    this.contentMode = event.target.value;
    if (this.contentMode === 'startOfAyah') this.suraFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  onSuraOrderChange(event: any): void {
    this.suraOrder = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSuraFilterChange(event: any): void {
    this.suraFilter = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onInnerQueryChange(): void {
    this.updateDisplayData(); // currentPage reset happens inside updateDisplayData (Bug 3)
  }

  onViewModeChange(mode: 'flat' | 'grouped'): void {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  // ── core filter+sort ───────────────────────────────────────────────────────

  private applyFilters(): void {
    let data = [...this.originalData];

    if (this.contentMode === 'startOfAyah') {
      const query = this.normalizer.strip(this.searchQuery?.trim() || '');
      if (query) {
        data = data.filter(item => {
          const text = this.normalizer.strip(item.data?.AyaText?.trim() || '');
          return text.startsWith(query);
        });
      }
    } else if (this.suraFilter) {
      data = data.filter(item => item.data?.Sura_Name === this.suraFilter);
    }

    if (this.suraOrder === 'mushafOrder') {
      data.sort((a, b) => {
        const suraDiff = parseInt(a.data?.nOFSura ?? '0', 10) - parseInt(b.data?.nOFSura ?? '0', 10);
        return suraDiff !== 0 ? suraDiff : parseInt(a.data?.Aya_N ?? '0', 10) - parseInt(b.data?.Aya_N ?? '0', 10);
      });
    } else {
      data.sort((a, b) => {
        const nameA = a.data?.Sura_Name?.trim() || '';
        const nameB = b.data?.Sura_Name?.trim() || '';
        const diff  = nameA.localeCompare(nameB, 'ar');
        return diff !== 0 ? diff : parseInt(a.data?.Aya_N ?? '0', 10) - parseInt(b.data?.Aya_N ?? '0', 10);
      });
    }

    this.selectedData = { data };
    this.updateDisplayData();
  }

  // Bug 3 fix: always reset currentPage here so every caller (applyFilters + onInnerQueryChange)
  // lands back on page 1 instead of showing a blank page.
  private updateDisplayData(): void {
    const base = this.selectedData?.data ?? [];
    const q    = this.innerQuery?.trim();

    if (!q) {
      this._displayData = base;
    } else {
      const qFull   = this.normalizer.strip(q);
      const qSimple = this.normalizer.stripSimple(q);
      this._displayData = base.filter(item => {
        const text = item.data?.AyaText_Othmani || item.data?.AyaText || '';
        return this.normalizer.strip(text).includes(qFull) ||
               this.normalizer.stripSimple(text).includes(qSimple);
      });
    }

    this.currentPage = 1;  // Bug 3 fix
    this.cdr.detectChanges();
  }

  // ── pagination helpers ─────────────────────────────────────────────────────

  get displayCount(): number { return this._displayData.length; }

  get totalPages(): number { return Math.max(1, Math.ceil(this._displayData.length / this.pageSize)); }

  get pagedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this._displayData.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const pages: number[] = [];
    const delta = 2;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= cur - delta && i <= cur + delta)) pages.push(i);
    }
    const result: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) result.push(-1);
      result.push(pages[i]);
    }
    return result;
  }

  prevPage(): void { if (this.currentPage > 1)              { this.currentPage--; this.cdr.detectChanges(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.cdr.detectChanges(); } }
  goToPage(n: number): void { if (n >= 1 && n <= this.totalPages) { this.currentPage = n; this.cdr.detectChanges(); } }

  // ── trackBy helpers (Issue 16) ─────────────────────────────────────────────

  trackByItem(_: number, item: any): any    { return item.data?.id ?? _; }
  trackByGroup(_: number, g: SuraGroup): string { return g.name; }

  // ── grouped view ───────────────────────────────────────────────────────────

  get groupedData(): SuraGroup[] {
    const map = new Map<string, SuraGroup>();
    for (const item of this._displayData) {
      const name = (item.data?.Sura_Name || '').trim() || '—';
      const num  = parseInt(item.data?.nOFSura ?? '0', 10) || 0;  // Bug 7 fix
      if (!map.has(name)) map.set(name, { name, suraNum: num, items: [] });
      map.get(name)!.items.push(item);
    }
    return Array.from(map.values()).sort((a, b) =>
      this.suraOrder === 'mushafOrder'
        ? a.suraNum - b.suraNum
        : a.name.localeCompare(b.name, 'ar')
    );
  }

  toggleSuraGroup(name: string): void {
    this.collapsedSuras.has(name) ? this.collapsedSuras.delete(name) : this.collapsedSuras.add(name);
    this.cdr.detectChanges();
  }

  isSuraCollapsed(name: string): boolean { return this.collapsedSuras.has(name); }

  collapseAll(): void { this.groupedData.forEach(g => this.collapsedSuras.add(g.name)); this.cdr.detectChanges(); }
  expandAll(): void  { this.collapsedSuras.clear(); this.cdr.detectChanges(); }

  // ── navigation ─────────────────────────────────────────────────────────────

  goToAya(item: any): void {
    const page = item.data?.nOFPage;
    if (!page) return;
    localStorage.setItem('pendingNavPage', String(page));
    this.router.navigateByUrl('/home');
  }

  // ── export helpers ────────────────────────────────────────────────────────

  /** Bug 4 fix: escape HTML special chars before injecting into export markup. */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private exportCols(): ColumnDef[] {
    return this.visibleColumns.length > 0 ? this.visibleColumns : ALL_COLUMNS.filter(c => c.isDefault);
  }

  exportCSV(): void {
    const cols   = this.exportCols();
    const header = cols.map(c => c.label).join(',');
    const rows   = this._displayData.map(item =>
      cols.map(c => {
        const val = String(item.data?.[c.key] ?? '')
          .replace(/"/g, '""')   // escape quotes
          .replace(/\n/g, ' ')   // Issue 10: escape newlines
          .replace(/\r/g, '');
        return `"${val}"`;
      }).join(',')
    );
    const csv  = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `quran-search-${this.searchQuery || 'results'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportWord(): void {
    const cols      = this.exportCols();
    const headerRow = cols.map(c =>
      `<th style="border:1px solid #ccc;padding:6px 10px;background:#f0f0f0;font-weight:bold;">${this.escapeHtml(c.label)}</th>`
    ).join('');
    const bodyRows  = this._displayData.map(item => {
      const cells = cols.map(c =>
        `<td style="border:1px solid #ccc;padding:6px 10px;">${this.escapeHtml(String(item.data?.[c.key] ?? ''))}</td>`
      ).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    // Issue 13 fix: add dir="rtl" lang="ar" on html tag so Word renders RTL correctly
    const html = `
      <html dir="rtl" lang="ar"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8">
        <style>
          body  { font-family: "Traditional Arabic", Arial, sans-serif; direction: rtl; }
          table { border-collapse: collapse; width: 100%; }
          th, td { text-align: right; }
        </style>
      </head>
      <body>
        <h3 style="margin-bottom:12px;">نتائج البحث: ${this.escapeHtml(this.searchQuery)} (${this._displayData.length} آية)</h3>
        <table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>
      </body></html>`;

    const blob = new Blob(['\uFEFF' + html], { type: 'application/msword' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `quran-search-${this.searchQuery || 'results'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportPDF(): void {
    const cols      = this.exportCols();
    const headerRow = cols.map(c => `<th>${this.escapeHtml(c.label)}</th>`).join('');
    const bodyRows  = this._displayData.map(item => {
      const cells = cols.map(c => `<td>${this.escapeHtml(String(item.data?.[c.key] ?? ''))}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body  { font-family: "Traditional Arabic", Arial, sans-serif; direction: rtl; font-size: 12px; }
        h3    { margin-bottom: 10px; font-size: 14px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #bbb; padding: 5px 8px; text-align: right; }
        th { background: #f0f0f0; font-weight: bold; }
        tr:nth-child(even) { background: #fafafa; }
      </style>
    </head><body>
      <h3>نتائج البحث: ${this.escapeHtml(this.searchQuery)} (${this._displayData.length} آية)</h3>
      <table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>
    </body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;';
    document.body.appendChild(iframe);
    iframe.contentDocument!.open();
    iframe.contentDocument!.write(html);
    iframe.contentDocument!.close();
    iframe.contentWindow!.focus();
    setTimeout(() => {
      iframe.contentWindow!.print();
      setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 1000);
    }, 500);
  }

  // ── cell rendering helpers ─────────────────────────────────────────────────

  getCellValue(item: any, col: ColumnDef): string { return item.data?.[col.key] ?? ''; }

  isOthmaniCol(col: ColumnDef): boolean { return col.type === 'othmani'; }
  isTextCol(col: ColumnDef): boolean    { return col.type === 'text'; }
  isBadgeCol(col: ColumnDef): boolean   { return col.type === 'badge'; }

  // ── text helpers ───────────────────────────────────────────────────────────

  highlightText(text: string, search: string): SafeHtml {
    if (!search?.trim() || !text) return text || '';

    const effectiveSearch = this.innerQuery?.trim() || search;
    const queryFull   = this.normalizer.strip(effectiveSearch.trim()).split(' ').filter(w => w);
    const querySimple = this.normalizer.stripSimple(effectiveSearch.trim()).split(' ').filter(w => w);

    const highlighted = text.split(' ').map(word => {
      const sf = this.normalizer.strip(word);
      const ss = this.normalizer.stripSimple(word);
      const matches = queryFull.some(q => sf.includes(q)) || querySimple.some(q => ss.includes(q));
      // Issue 15 fix: add dir="rtl" so bidi algorithm doesn't reorder highlighted chars
      return matches ? `<span class="highlight" dir="rtl">${word}</span>` : word;
    }).join(' ');

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
