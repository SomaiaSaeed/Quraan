import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { DataSharingService } from "src/app/dashboard/search/services/data-sharing.service";
import { Search } from "src/app/core/services/search.service";
import { ArabicNormalizerService } from "src/app/core/services/arabic-normalizer.service";
import { SearchHistoryService } from "src/app/core/services/search-history.service";

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
export class MainSearchComponent implements OnInit, OnDestroy {
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

  // Issue 8 fix: debounce so 6000-aya filter doesn't run on every keystroke
  private inputSubject = new Subject<string>();
  private destroy$     = new Subject<void>();

  constructor(
    private _router: Router,
    public dialog: MatDialog,
    private dataSharingService: DataSharingService,
    private normalizer: ArabicNormalizerService,    // Issue 9 – shared normaliser
    private historyService: SearchHistoryService,   // Bug 5  – shared history
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.inputSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(value => this._performSearch(value));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasText(): boolean {
    return !!this.searchWord?.trim();
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
    this.inputSubject.next(value);  // debounced
  }

  private _performSearch(value: string): void {
    const word = value?.trim();
    if (!word) return;

    const query       = this.normalizer.strip(word);
    const querySimple = this.normalizer.stripSimple(word);

    const all     = this.searchInstance.table_othmani;
    const matched = all.filter((aya: any) => {
      const ayaText   = aya.AyaText || '';
      const ayaSimple = this.normalizer.stripSimple((aya.AyaText_Othmani || '').trim());
      return ayaText.includes(query) || ayaSimple.includes(querySimple);
    });

    this.searchResults = matched.map((aya: any) => ({ data: aya }));
    this.results       = matched.slice(0, 5).map((aya: any) => aya.AyaText_Othmani);
    this.autocompleteItems = matched.slice(0, 8).map((aya: any) => ({
      othmani: aya.AyaText_Othmani,
      sura:    aya.Sura_Name,
      aya:     aya.Aya_N,
      data:    aya,
    }));
    this.isLoading = false;
  }

  onFocus(): void {
    if (this.searchWord?.trim()) return;

    const history = this.historyService.items;  // Bug 5 – shared service
    if (history.length > 0) {
      this.isShowingHistory = true;
      this.showDropdown = true;
      this.autocompleteItems = history.map(w => ({
        othmani: w, sura: '', aya: '', data: null
      }));
    }
  }

  onBlur(): void {
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
    this.historyService.remove(word);  // Bug 5 – shared service
    this.autocompleteItems = this.autocompleteItems.filter(i => i.othmani !== word);
    if (this.autocompleteItems.length === 0) this.showDropdown = false;
  }

  // ── popup ──────────────────────────────────────────────────────────────────

  openSearchResult(inp?: HTMLInputElement): void {
    if (!this.searchWord?.trim()) return;
    if (inp) this.onInput(inp.value);
    this.historyService.add(this.searchWord);  // Bug 5 – shared service
    this.showDropdown = false;

    this.dialog.open(this.searchResult, {
      width: "380px",
      panelClass: "popup-center",
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  displayResults(): void {
    this.historyService.add(this.searchWord);  // Bug 5 – shared service
    this.closeDialog();
    this.dataSharingService.updateSelectedData(this.searchResults, this.searchWord);
    this._router.navigateByUrl("/search");
  }

  highlightText(text: string): SafeHtml {
    if (!text || !this.searchWord?.trim()) return text || '';
    const queryFull   = this.normalizer.strip(this.searchWord.trim()).split(' ').filter(w => w);
    const querySimple = this.normalizer.stripSimple(this.searchWord.trim()).split(' ').filter(w => w);
    const highlighted = text.split(' ').map(word => {
      const sf = this.normalizer.strip(word);
      const ss = this.normalizer.stripSimple(word);
      const matches = queryFull.some(q => sf.includes(q)) || querySimple.some(q => ss.includes(q));
      return matches ? `<span class="hw">${word}</span>` : word;
    }).join(' ');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
