import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataSharingService, ALL_COLUMNS, ColumnDef } from '../../services/data-sharing.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  pageSize: number = 50;
  currentPage: number = 1;
  readonly pageSizeOptions = [25, 50, 100, 200];

  // ── grouped view ──────────────────────────────────────────────────────────
  collapsedSuras = new Set<string>();

  // ── export ────────────────────────────────────────────────────────────────

  // ── internal display cache ────────────────────────────────────────────────
  private _displayData: any[] = [];

  constructor(
    private dataSharingService: DataSharingService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dataSharingService.selectedData$.subscribe(combinedData => {
      this.selectedData = combinedData;
      this.originalData = [...this.selectedData.data];
      this.searchQuery  = combinedData.searchQuery;

      const suraMap = new Map<string, number>();
      this.originalData.forEach(item => {
        const name = item.data?.Sura_Name;
        const num  = parseInt(item.data?.nOFSura);
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
    this.currentPage = 1;
    this.updateDisplayData();
  }

  onViewModeChange(mode: 'flat' | 'grouped'): void {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  // ── core filter+sort ───────────────────────────────────────────────────────

  private applyFilters(): void {
    let data = [...this.originalData];

    if (this.contentMode === 'startOfAyah') {
      const query = this.stripTashkeel(this.searchQuery?.trim() || '');
      if (query) {
        data = data.filter(item => {
          const text = this.stripTashkeel(item.data?.AyaText?.trim() || '');
          return text.startsWith(query);
        });
      }
    } else if (this.suraFilter) {
      data = data.filter(item => item.data?.Sura_Name === this.suraFilter);
    }

    if (this.suraOrder === 'mushafOrder') {
      data.sort((a, b) => {
        const suraDiff = parseInt(a.data?.nOFSura) - parseInt(b.data?.nOFSura);
        return suraDiff !== 0 ? suraDiff : parseInt(a.data?.Aya_N) - parseInt(b.data?.Aya_N);
      });
    } else {
      data.sort((a, b) => {
        const nameA = a.data?.Sura_Name?.trim() || '';
        const nameB = b.data?.Sura_Name?.trim() || '';
        const diff  = nameA.localeCompare(nameB, 'ar');
        return diff !== 0 ? diff : parseInt(a.data?.Aya_N) - parseInt(b.data?.Aya_N);
      });
    }

    this.selectedData = { data };
    this.updateDisplayData();
  }

  private updateDisplayData(): void {
    const base = this.selectedData?.data ?? [];
    const q = this.innerQuery?.trim();

    if (!q) {
      this._displayData = base;
    } else {
      const qFull   = this.stripTashkeel(q);
      const qSimple = this.stripTashkeelSimple(q);
      this._displayData = base.filter(item => {
        const text = item.data?.AyaText_Othmani || item.data?.AyaText || '';
        return this.stripTashkeel(text).includes(qFull) ||
               this.stripTashkeelSimple(text).includes(qSimple);
      });
    }

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
      if (i === 1 || i === total || (i >= cur - delta && i <= cur + delta)) {
        pages.push(i);
      }
    }
    // Insert ellipsis markers as -1
    const result: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) result.push(-1);
      result.push(pages[i]);
    }
    return result;
  }

  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.cdr.detectChanges(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.cdr.detectChanges(); } }
  goToPage(n: number): void { if (n >= 1 && n <= this.totalPages) { this.currentPage = n; this.cdr.detectChanges(); } }

  // ── grouped view helpers ───────────────────────────────────────────────────

  get groupedData(): SuraGroup[] {
    const map = new Map<string, SuraGroup>();
    for (const item of this._displayData) {
      const name = item.data?.Sura_Name || '';
      const num  = parseInt(item.data?.nOFSura) || 0;
      if (!map.has(name)) map.set(name, { name, suraNum: num, items: [] });
      map.get(name)!.items.push(item);
    }
    return Array.from(map.values()).sort((a, b) => {
      if (this.suraOrder === 'mushafOrder') return a.suraNum - b.suraNum;
      return a.name.localeCompare(b.name, 'ar');
    });
  }

  toggleSuraGroup(name: string): void {
    if (this.collapsedSuras.has(name)) this.collapsedSuras.delete(name);
    else this.collapsedSuras.add(name);
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

  // ── export ────────────────────────────────────────────────────────────────

  exportCSV(): void {
    const cols = this.visibleColumns.length > 0 ? this.visibleColumns : ALL_COLUMNS.filter(c => c.isDefault);
    const header = cols.map(c => c.label).join(',');
    const rows = this._displayData.map(item =>
      cols.map(c => {
        const val = String(item.data?.[c.key] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    );
    const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM for Arabic in Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `quran-search-${this.searchQuery || 'results'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportWord(): void {
    const cols = this.visibleColumns.length > 0 ? this.visibleColumns : ALL_COLUMNS.filter(c => c.isDefault);
    const headerRow = cols.map(c => `<th style="border:1px solid #ccc;padding:6px 10px;background:#f0f0f0;font-weight:bold;">${c.label}</th>`).join('');
    const bodyRows  = this._displayData.map(item => {
      const cells = cols.map(c => `<td style="border:1px solid #ccc;padding:6px 10px;">${item.data?.[c.key] ?? ''}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8">
        <style>
          body { font-family: "Traditional Arabic", Arial, sans-serif; direction: rtl; }
          table { border-collapse: collapse; width: 100%; }
          th, td { text-align: right; }
        </style>
      </head>
      <body>
        <h3 style="margin-bottom:12px;">نتائج البحث: ${this.searchQuery} (${this._displayData.length} آية)</h3>
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
    const cols = this.visibleColumns.length > 0 ? this.visibleColumns : ALL_COLUMNS.filter(c => c.isDefault);
    const headerRow = cols.map(c => `<th>${c.label}</th>`).join('');
    const bodyRows  = this._displayData.map(item => {
      const cells = cols.map(c => `<td>${item.data?.[c.key] ?? ''}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: "Traditional Arabic", Arial, sans-serif; direction: rtl; font-size: 12px; }
        h3   { margin-bottom: 10px; font-size: 14px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #bbb; padding: 5px 8px; text-align: right; }
        th { background: #f0f0f0; font-weight: bold; }
        tr:nth-child(even) { background: #fafafa; }
      </style>
    </head><body>
      <h3>نتائج البحث: ${this.searchQuery} (${this._displayData.length} آية)</h3>
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
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  }

  // ── cell rendering helpers ─────────────────────────────────────────────────

  getCellValue(item: any, col: ColumnDef): string {
    return item.data?.[col.key] ?? '';
  }

  isOthmaniCol(col: ColumnDef): boolean { return col.type === 'othmani'; }
  isTextCol(col: ColumnDef): boolean    { return col.type === 'text'; }
  isBadgeCol(col: ColumnDef): boolean   { return col.type === 'badge'; }

  // ── text helpers ───────────────────────────────────────────────────────────

  private stripTashkeel(text: string): string {
    return text
      .replace(/[\u064B-\u065F]/g, '')              // tashkeel: tanwin, kasra, fatha, damma, shadda, sukun … (U+064B–U+065F)
      .replace(/\u0670/g, '\u0627')                 // superscript alef ٰ  → ا  (e.g. ٱلرَّحْمَٰنِ → الرحمان)
      .replace(/\u0671/g, '\u0627')                 // alef wasla       ٱ  → ا  (Othmani word-start alef)
      .replace(/\u0649/g, '\u064A')                 // alef maqsura     ى  → ي  (final yeh without dots)
      .replace(/[\u06DF\u06E0\u06E2\u06E5\u06E6\u06E8\u06EA\u06EB\u06EC\u06ED\u06DC]/g, '') // Quranic annotation marks: ۟(06DF) ۠(06E0) ۢ(06E2) ۥ(06E5) ۦ(06E6) ۨ(06E8) ۪(06EA) ۫(06EB) ۬(06EC) ۭ(06ED) ۜ(06DC)
      .replace(/\u0640/g, '');                      // kashida (tatweel) ـ  → removed (Arabic elongation stroke)
  }

  private stripTashkeelSimple(text: string): string {
    return text
      .replace(/[\u064B-\u065F\u0670]/g, '')        // tashkeel (U+064B–U+065F) + superscript alef ٰ (U+0670) — all stripped, NOT replaced (keeps الرحمن as-is)
      .replace(/\u0671/g, '\u0627')                 // alef wasla       ٱ  → ا
      .replace(/\u0649/g, '\u064A')                 // alef maqsura     ى  → ي
      .replace(/[\u06DF\u06E0\u06E2\u06E5\u06E6\u06E8\u06EA\u06EB\u06EC\u06ED\u06DC]/g, '') // Quranic annotation marks: ۟(06DF) ۠(06E0) ۢ(06E2) ۥ(06E5) ۦ(06E6) ۨ(06E8) ۪(06EA) ۫(06EB) ۬(06EC) ۭ(06ED) ۜ(06DC)
      .replace(/\u0640/g, '');                      // kashida (tatweel) ـ  → removed
  }

  highlightText(text: string, search: string): SafeHtml {
    if (!search?.trim() || !text) return text || '';

    const effectiveSearch = this.innerQuery?.trim() || search;
    const queryFull   = this.stripTashkeel(effectiveSearch.trim()).split(' ').filter(w => w);
    const querySimple = this.stripTashkeelSimple(effectiveSearch.trim()).split(' ').filter(w => w);

    const highlighted = text.split(' ').map(word => {
      const sf = this.stripTashkeel(word);
      const ss = this.stripTashkeelSimple(word);
      const matches = queryFull.some(q => sf.includes(q)) || querySimple.some(q => ss.includes(q));
      return matches ? `<span class="highlight">${word}</span>` : word;
    }).join(' ');

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
