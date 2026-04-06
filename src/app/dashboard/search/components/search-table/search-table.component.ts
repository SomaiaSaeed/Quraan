import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataSharingService, ALL_COLUMNS, ColumnDef } from '../../services/data-sharing.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    this.applyFilters();
  }

  onSuraOrderChange(event: any): void {
    this.suraOrder = event.target.value;
    this.applyFilters();
  }

  onSuraFilterChange(event: any): void {
    this.suraFilter = event.target.value;
    this.applyFilters();
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
    this.cdr.detectChanges();
  }

  // ── navigation ─────────────────────────────────────────────────────────────

  goToAya(item: any): void {
    const page = item.data?.nOFPage;
    if (!page) return;
    localStorage.setItem('pendingNavPage', String(page));
    this.router.navigateByUrl('/home');
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

    const queryFull   = this.stripTashkeel(search.trim()).split(' ').filter(w => w);
    const querySimple = this.stripTashkeelSimple(search.trim()).split(' ').filter(w => w);

    const highlighted = text.split(' ').map(word => {
      const sf = this.stripTashkeel(word);
      const ss = this.stripTashkeelSimple(word);
      const matches = queryFull.some(q => sf.includes(q)) || querySimple.some(q => ss.includes(q));
      return matches ? `<span class="highlight">${word}</span>` : word;
    }).join(' ');

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
