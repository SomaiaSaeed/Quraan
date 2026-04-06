import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { DataSharingService } from "src/app/dashboard/search/services/data-sharing.service";
import { Search } from "src/app/core/services/search.service";
// MatAutocomplete replaced by custom dropdown panel

export interface SearchResultItem {
  othmani: string;
  sura: string;
  aya: string;
  data: any;
}

@Component({
  selector: "app-main-search",
  templateUrl: "./main-search.component.html",
  styleUrls: ["./main-search.component.scss"],
})
export class MainSearchComponent implements OnInit {
  @ViewChild("searchResult", { static: true }) searchResult: ElementRef | any;

  /** Othmani strings shown in the popup (first 5) */
  results: string[] = [];

  /** Rich items shown in the autocomplete dropdown */
  autocompleteItems: SearchResultItem[] = [];

  /** Full result set for navigation */
  searchResults: any[] = [];

  searchWord: string = '';
  isShowingHistory = false;
  isLoading = false;
  showDropdown = false;

  private searchInstance = new Search();

  constructor(
    private _router: Router,
    public dialog: MatDialog,
    private dataSharingService: DataSharingService
  ) {}

  ngOnInit() {}

  get hasText(): boolean {
    return !!this.searchWord?.trim();
  }

  // ── normalization ──────────────────────────────────────────────────────────

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

  // ── search ─────────────────────────────────────────────────────────────────

  onInput(value: string): void {
    this.searchWord = value;
    const word = value?.trim();

    if (!word) {
      this.autocompleteItems = [];
      this.results = [];
      this.searchResults = [];
      this.isShowingHistory = false;
      this.showDropdown = false;
      return;
    }

    this.isLoading = true;
    this.isShowingHistory = false;
    this.showDropdown = true;

    const query       = this.stripTashkeel(word);
    const querySimple = this.stripTashkeelSimple(word);

    const all = this.searchInstance.table_othmani;
    const matched = all.filter((aya: any) => {
      const ayaText   = aya.AyaText || '';
      const ayaSimple = this.stripTashkeelSimple((aya.AyaText_Othmani || '').trim());
      return ayaText.includes(query) || ayaSimple.includes(querySimple);
    });

    this.searchResults = matched.map((aya: any) => ({ data: aya }));
    this.results = matched.slice(0, 5).map((aya: any) => aya.AyaText_Othmani);
    this.autocompleteItems = matched.slice(0, 8).map((aya: any) => ({
      othmani: aya.AyaText_Othmani,
      sura: aya.Sura_Name,
      aya: aya.Aya_N,
      data: aya,
    }));
    this.isLoading = false;
  }

  onFocus(): void {
    if (this.searchWord?.trim()) return; // already has text — keep current results

    const history = this.getSearchHistory();
    if (history.length > 0) {
      this.isShowingHistory = true;
      this.showDropdown = true;
      // most-recent first, reuse autocompleteItems slot for history strings
      this.autocompleteItems = history.slice().reverse().map(w => ({
        othmani: w, sura: '', aya: '', data: null
      }));
    }
  }

  onBlur(): void {
    // Delay hiding so click events on dropdown items still fire
    setTimeout(() => { this.showDropdown = false; }, 200);
  }

  clearSearch(inp: HTMLInputElement): void {
    inp.value = '';
    this.searchWord = '';
    this.autocompleteItems = [];
    this.results = [];
    this.searchResults = [];
    this.isShowingHistory = false;
    this.showDropdown = false;
    inp.focus();
  }

  selectItem(item: SearchResultItem, inp: HTMLInputElement): void {
    if (this.isShowingHistory) {
      inp.value = item.othmani;
      this.searchWord = item.othmani;
      this.isShowingHistory = false;
      this.onInput(item.othmani);
    } else {
      inp.value = item.othmani;
      this.searchWord = item.othmani;
      this.showDropdown = false;
    }
  }

  removeHistoryItem(event: MouseEvent, word: string): void {
    event.stopPropagation();
    const history = this.getSearchHistory().filter(w => w !== word);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    this.autocompleteItems = this.autocompleteItems.filter(i => i.othmani !== word);
    if (this.autocompleteItems.length === 0) this.showDropdown = false;
  }

  // ── popup ──────────────────────────────────────────────────────────────────

  openSearchResult(inp?: HTMLInputElement): void {
    if (!this.searchWord?.trim()) return;
    if (inp) this.onInput(inp.value);
    this.saveToHistory(this.searchWord);
    this.showDropdown = false;

    this.dialog.open(this.searchResult, {
      width: "520px",
      panelClass: "popup-center",
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  displayResults(): void {
    this.saveToHistory(this.searchWord);
    this.closeDialog();
    this.dataSharingService.updateSelectedData(this.searchResults, this.searchWord);
    this._router.navigateByUrl("/search");
  }

  // ── history helpers ────────────────────────────────────────────────────────

  private getSearchHistory(): string[] {
    try {
      const stored = localStorage.getItem('searchHistory');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToHistory(word: string): void {
    if (!word?.trim()) return;
    const history = this.getSearchHistory();
    const idx = history.indexOf(word);
    if (idx !== -1) history.splice(idx, 1);
    history.push(word);
    if (history.length > 10) history.shift();
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }
}
