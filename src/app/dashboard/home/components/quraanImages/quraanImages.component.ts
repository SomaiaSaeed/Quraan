import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation,AfterViewInit } from "@angular/core";
import { CarouselComponent, OwlOptions, SlidesOutputData } from "ngx-owl-carousel-o";
import { MenuItem } from "primeng/api";
import { ContextMenu } from "primeng/contextmenu";
import { forkJoin } from "rxjs";
import { BookmarkService } from "src/app/core/services/bookmark.service";
import { ListenService } from "src/app/dashboard/listen/services/listen.service";
import { Search } from "src/app/core/services/search.service";
import { PrintService } from "src/app/shared/print/print.service";
import { NgxSpinnerService } from "ngx-spinner";


const QuranInJsonURL = "assets/jsonData/QuranInJson.json";
const QuranPagesURL = "assets/jsonData/QuranPages.json";
const QuranPagesWithLinesURL = "assets/jsonData/QuranPagesWithLines.json";

interface Motashabehat {
  id:number,
  isRight: boolean;
  moade3: any[];
  height: string;
  top: string;
}

interface Span {
  aya: string;
  top: string;
  left: string;
  width: string;
  height: string;
}

export interface MotashabehatSpan {
  id: number;
  highlighted:boolean;
  isRight: boolean;
  moade3: string;
  height: string;
  top: string;
}

export interface SpansOfColoredWords {
  top: string;
  left: string;
  width: string;
  color: string;
  coloredWord: string,
  isStatic?: boolean;
}

export interface InputItem {
  motashabehat: Motashabehat;
  ayat: any[];
  aya: string;
  ayaId: string;
  spans: Span[];
  motashabehatSpans: MotashabehatSpan[];
  spansOfColoredWords: SpansOfColoredWords[];
  isActive: boolean;
  href: string;
  activeAya: number;
  matchedWord: string;
  arrOfColoredWords: ArrOfColoredWords[];
  errorFactor: string;
}

interface AyaDetail {
  suraWithIndex: string;
  errorFactor: string;
  top: string;
  id: number;
  text: string;
  index: number;
  sura: string;
  lastWord: string;
  matchScore?: number;
  suraIndex?: number;
}

interface ArrOfColoredWords {
  word: string;
  color: string;
  lineIndex?: number;
  left?: string;
  isStatic?: boolean;
}

interface AllAya {
  errorFactor: string;
  top: string;
  id: number;
  aya: string;
  numOfCharsInWholeAya: number;
  ayaIndex: number;
  arrOfColoredWords: ArrOfColoredWords[];
  sura: string;
  suraWithIndex: string;
  matchedWord: string;
  mooade3: {
    suraWithIndex: string;
    aya?: string;
    id: number;
    color: string;
    matchScore?: number;
    suraIndex?: number;
    ayaIndex?: number;
  }[];
}

@Component({
  selector: "app-quraanImages",
  templateUrl: "./quraanImages.component.html",
  styleUrls: ["./quraanImages.component.scss"],
  styles: [`
  // .matched-underline {
  //   font-weight: 700;
  //   text-decoration: underline;
  //   text-decoration-thickness: 2px;
  //   text-underline-offset: 6px;
  //   text-decoration-color: #90ee90//var(--underline-color, #000);
  // }
`],
encapsulation: ViewEncapsulation.None

})
export class QuraanImagesComponent implements OnInit, AfterViewInit, OnDestroy {
  colorsRendered: boolean = false;
  similarCount!: number;
  suraCount!: number;


  // onPageChange($event: SlidesOutputData) {
  //   debugger
  //   // this.inputs = [];
  //   // this.resetDrawing();
  //   this.pageNumber = parseInt($event?.slides?.[0]?.id ?? "0") + 1;
  //   this.resetDrawing();
  //   if (this._quranInJson == null || this._quranPages == null) {
  //     this.loadQuranJson();
  //   } else {
  //     this.generateMotashabehatOfSelectedPage(this.pageNumber);
  //     this.determineHighlight();
  //     this.drawColoredWords();
  //   }
    
  // }
private lastPageProcessed = -1;
pageNumber: number = 1;

/** Pages already loaded via loadPageQuick — prevents duplicate requests */
private _quickLoadedPages = new Set<number>();

/**
 * Fast path: loads only the current page's data (~3 KB each file) so the
 * mushaf renders immediately instead of waiting for the full 12 MB payload.
 * The full loadQuranJson() still runs in background for motashabehat colors.
 */
private loadPageQuick(pageNumber: number): void {
  if (this._quickLoadedPages.has(pageNumber)) return;
  this._quickLoadedPages.add(pageNumber);

  forkJoin({
    lines: this._http.get<any>(`assets/jsonData/mushaf-lines/page-${pageNumber}.json`),
    page:  this._http.get<any>(`assets/jsonData/quran-pages/page-${pageNumber}.json`)
  }).subscribe({
    next: ({ lines, page }) => {
      const slide = this.quranPages.find((s: any) => s.pageNumber === pageNumber);
      if (!slide) return;

      // Populate textNoTashkeel needed by buildMushafLines word matching
      // NOTE: qAya.id is a number, slideAya.id is a string — use loose equality
      page.ayas?.forEach((qAya: any) => {
        const slideAya = slide.ayat.find((a: any) => String(a.id) === String(qAya.id));
        if (slideAya) slideAya.textNoTashkeel = qAya.text_without_tashkeel;
      });

      // Render immediately — colors will be applied later by drawColoredWords()
      if (lines?.lines) {
        this.buildMushafLines(slide, lines.lines);
      }
    },
    error: () => {
      // Per-page files missing — remove from cache so full loader can take over
      this._quickLoadedPages.delete(pageNumber);
    }
  });
}

ngAfterViewInit(): void {

  setTimeout(() => {
    const pendingPage = localStorage.getItem('pendingNavPage');
    const targetPage = pendingPage ? Number(pendingPage) : 1;

    if (pendingPage) {
      localStorage.removeItem('pendingNavPage');
      this.pageNumber = targetPage;
      this.navigateToPage(targetPage);
    } else {
      this.pageNumber = 1;
    }

    this.resetDrawing();

    // Fast path: render current page immediately from tiny per-page files (~3 KB)
    this.loadPageQuick(targetPage);

    // Background: load full data for motashabehat colors and similarities
    if (!this._quranInJson || !this._quranPages) {
      this.loadQuranJson();
    } else {
      this.generateMotashabehatOfSelectedPage(this.pageNumber);
      this.determineHighlight();
      this.drawColoredWords();
    }

  });
}

onPageChange(event: SlidesOutputData) {
  const slideId = event?.slides?.[0]?.id;
  const newPage = slideId ? Number(slideId) : (event.startPosition ?? 0) + 1;

  if (newPage === this.lastPageProcessed) return;

  this.lastPageProcessed = newPage;
  this.pageNumberChange.emit(newPage);
  this.renderPage(newPage);
}


private renderPage(page: number): void {
  this.pageNumber = page;
  this.pageNumberChange.emit(page);

  this.resetDrawing();

  if (!this._quranInJson || !this._quranPages) {
    this.loadQuranJson();
    return;
  }

  this.generateMotashabehatOfSelectedPage(page);
  this.determineHighlight();
  this.drawColoredWords();
}
  // onPageChange(event: SlidesOutputData) {

  //   const currentSlide = event?.slides?.[0];
  //   if (!currentSlide) return;
  
  //   const newPage = Number(currentSlide.id);
  
  //   // prevent recalculating same page
  //   if (newPage === this.lastPageProcessed) return;
  
  //   this.lastPageProcessed = newPage;
  //   this.pageNumber = newPage;
  
  //   this.resetDrawing();
  
  //   if (!this._quranInJson || !this._quranPages) {
  //     this.loadQuranJson();
  //     return;
  //   }
  
  //   this.generateMotashabehatOfSelectedPage(this.pageNumber);
  //   this.determineHighlight();
  //   this.drawColoredWords();
  // }

  trackPage(index: number, page: any) {
    return page.pageNumber;
  }


  @Output() onClick = new EventEmitter<number>(); // Assuming ayaId is a number
  @Output() onRight = new EventEmitter<any>();
  @Output() motahabehClick = new EventEmitter<any>();
  @Output() motshabehat = new EventEmitter<InputItem[]>(); // Assuming ayaId is a number
  @Output() pageNumberChange = new EventEmitter<number>();

  @ViewChild('menu') contextMenu!: ContextMenu;
  @ViewChild(CarouselComponent) carousel!: CarouselComponent;

  legendOpen = false;

  // Standard Medina Mushaf juz start pages (index 0 = juz 1)
  private static readonly JUZ_START_PAGES = [
    1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
    201, 221, 242, 262, 282, 302, 322, 342, 362, 382,
    402, 422, 442, 462, 482, 502, 522, 542, 562, 582
  ];

  getJuzForPage(pageNum: number): number {
    const starts = QuraanImagesComponent.JUZ_START_PAGES;
    let juz = 1;
    for (let i = 0; i < starts.length; i++) {
      if (pageNum >= starts[i]) juz = i + 1;
    }
    return juz;
  }

  // Quick Go To
  goToOpen   = false;
  goToMode: 'page' | 'sura' | 'aya' = 'page';
  goToPage   = 1;
  goToSuraIndex  = 1;
  goToAyaIndex   = 1;

  // ── Slideshow ────────────────────────────────────────────────────────────────
  slideshowPlaying = false;
  slideshowSpeed   = 3000; // ms per page
  private slideshowTimer: any = null;
  suraList: { index: number; name: string; ayaCount: number }[] = [];
  private pageToSlideIndex = new Map<number, number>();   // pageNumber → quranPages index


  private _quranPages: any;
  private _quranInJson: any;
  private _pagesWithLines: any[] = [];

  lastTop: number = 10;
  marginTop: number = 50;
  isShiftedVertically: boolean = false;
  arrOfAyaWords: string[] = [];
  motashabehatSpans: MotashabehatSpan[] = [];
  lastTopRight: number = 0;
  lastTopLeft: number = 0;
  spansOfColoredWords: SpansOfColoredWords[] = [];
  suras: string[] = ["البقرة", "آل عمران", "النساء", "المائدة"];
  isNextAyaLeft: boolean = false;
  selectedAyaIndex: number = 0;
  selectedAyaId: number = 0;

  colors = [
    { color: "#FF0000", text: "كلمة وحيدة بداية الأية" },// RED
    { color: "#00FF00", text: "موضعين" },// GREEN
    { color: "#0000FF", text: "ثلاث مواضع" },// BLUE
    { color: "#FFFF00", text: "أربع مواضع" },// YELLOW
    { color: "#800080", text: "أكثر من أربع مواضع" },// PURPLE
    { color: "#FFA500", text: "كلمة وحيدة وسط الأية" },// ORANGE
    { color: "#90ee90", text: "موضعين وسط الأية" }, // LIGHT GREEN
    { color: "#ADD8E6", text: "ثلاث مواضع وسط الأية" },// LIGHT BLUE
  ];

  inputs: InputItem[] = [];
  private searchWord: string = "";
  private x: AyaDetail[] = [];
  private allAyas: AllAya[] = [];

  @Input() images: string | any;
  quranPages: any[] = [];
  contextMenuItems: MenuItem[] = [];
  selectedAya: any = null;
  customOptions: OwlOptions = {
    loop: false,
    rtl: true,
    startPosition: 0,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    autoHeight: false,
    dots: false,
    navSpeed: 700,
    navText: ["&#10095;", "&#10094;"],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
    nav: false,
  };


  showBookmarkDialog = false;
  bookmarkNote = '';
  private _ayaAudio: HTMLAudioElement | null = null;

  // ── Tafseer bottom sheet ──────────────────────────────────────────────────
  readonly TAFSEER_EDITIONS = [
    { id: 'ar.muyassar',  name: 'الميسر' },
    { id: 'ar.jalalayn',  name: 'الجلالين' },
  //   { id: 'ar.ibnikathir', name: 'ابن كثير' },
  //   { id: 'ar.tabari',    name: 'الطبري' },
  //   { id: 'ar.wahidi',    name: 'الواحدي' },
  ];
  tafseerOpen     = false;
  tafseerLoading  = false;
  tafseerText     = '';
  tafseerEdition  = 'ar.muyassar';

  constructor(private _searchInstance: Search, private _http: HttpClient, private _bookmarkService: BookmarkService, private _listenService: ListenService, private _printService: PrintService, private _spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.quranPages = this.groupQuranPages();

    // Build page → slide index lookup
    this.quranPages.forEach((page, idx) => {
      if (!this.pageToSlideIndex.has(page.pageNumber)) {
        this.pageToSlideIndex.set(page.pageNumber, idx);
      }
    });

    // Build sura list from table_othmani
    const suraMap = new Map<number, { name: string; ayaCount: number }>();
    this._searchInstance.table_othmani.forEach((row: any) => {
      const n = Number(row.nOFSura);
      if (!suraMap.has(n)) suraMap.set(n, { name: row.Sura_Name, ayaCount: 0 });
      suraMap.get(n)!.ayaCount++;
    });
    this.suraList = Array.from(suraMap.entries())
      .map(([index, v]) => ({ index, ...v }))
      .sort((a, b) => a.index - b.index);

    const motashabehatSettings = localStorage.getItem('motashabehatSettings');
    if (motashabehatSettings) {
      const data = JSON.parse(motashabehatSettings);
      this.similarCount = data.similarCount;
      this.suraCount = data.suraCount;
    } else {
      this.similarCount = 7;
      this.suraCount = 6;
    }
  }



  convertToArabicNumbers(num: string | number): string {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, (d) => arabicNumbers[parseInt(d, 10)]);
  }

  /** Normalize Arabic presentation form characters (U+FB50–U+FEFF) to standard Arabic */
  private normalizeSuraName(name: string): string {
    return name.normalize('NFKC')
      .replace(/\uFEF5|\uFEF6/g, 'لآ')
      .replace(/\uFEF7|\uFEF8/g, 'لأ')
      .replace(/\uFEF9|\uFEFA/g, 'لإ')
      .replace(/\uFEFB|\uFEFC/g, 'لا');
  }

  groupQuranPages(): any[] {
    // One slide per Mushaf page — a page may contain multiple suras
    const pageMap = new Map<number, any>();

    this._searchInstance.table_othmani.forEach((aya: any) => {
      const pageNum = Number(aya.nOFPage);
      const suraName = aya.Sura_Name;
      const suraNumber = Number(aya.nOFSura) || 0;

      if (!pageMap.has(pageNum)) {
        pageMap.set(pageNum, {
          pageNumber: pageNum,
          ayat: [],
          juzNumber: this.getJuzForPage(pageNum),
          pageSuraName: this.normalizeSuraName(suraName),
        });
      }

      const slide = pageMap.get(pageNum);
      slide.ayat.push({
        id: aya.id,
        text: aya.AyaText_Othmani,
        ayaNumber: aya.Aya_N,
        suraName: this.normalizeSuraName(suraName),
        suraNumber: suraNumber,
        highlighted: false,
        matchedWord: '',
        arrOfColoredWords: []
      });
    });

    return Array.from(pageMap.values()).sort((a, b) => a.pageNumber - b.pageNumber);
  }

  toggleHighlight(aya: any) {
    aya.highlighted = !aya.highlighted;
    this.onClick.emit(aya);
  }

  /** Returns true if any segment in the line belongs to a highlighted aya */
  isLineHighlighted(line: any): boolean {
    return line.segments?.some((seg: any) => seg.aya?.highlighted) ?? false;
  }

  /** True if this is the FIRST line of a highlighted aya */
  isFirstHighlightedLine(line: any, lineIdx: number): boolean {
    return line.segments?.some((seg: any) => seg.aya?.highlighted && seg.aya?._hlFirstLine === lineIdx) ?? false;
  }

  /** True if this is the LAST line of a highlighted aya */
  isLastHighlightedLine(line: any, lineIdx: number): boolean {
    return line.segments?.some((seg: any) => seg.aya?.highlighted && seg.aya?._hlLastLine === lineIdx) ?? false;
  }


  onRightClick(event: MouseEvent, aya: any) {
    event.preventDefault();
    this.selectedAya = aya;

    this.contextMenuItems = [
      {
        label: '📋 نسخ الآية',
        icon: 'pi pi-copy',
        command: () => this.copyAya()
      },
      {
        label: '🔗 مشاركة الآية',
        icon: 'pi pi-share-alt',
        command: () => this.shareAya()
      },
      {
        label: '⭐ حفظ الآية',
        icon: 'pi pi-bookmark',
        command: () => this.bookmarkAya()
      },
      {
        label: '🔊 استماع للآية',
        icon: 'pi pi-volume-up',
        command: () => this.listenToAya()
      },
      {
        label: '📖 تفسير الآية',
        icon: 'pi pi-book',
        command: () => this.showTafseer()
      }
    ];

    this.contextMenu.show(event);
  }

  private copyAya(): void {
    if (!this.selectedAya) return;
    const text = `${this.selectedAya.text} (${this.selectedAya.suraName}: ${this.selectedAya.ayaNumber})`;
    navigator.clipboard.writeText(text);
  }

  private shareAya(): void {
    if (!this.selectedAya) return;
    const text = `${this.selectedAya.text} (${this.selectedAya.suraName}: ${this.selectedAya.ayaNumber})`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  private bookmarkAya(): void {
    if (!this.selectedAya) return;
    this.bookmarkNote = '';
    this.showBookmarkDialog = true;
  }

  private listenToAya(): void {
    if (!this.selectedAya) return;
    if (this._ayaAudio) {
      this._ayaAudio.pause();
      this._ayaAudio = null;
    }
    const url = this._listenService.buildAudioUrl(this.selectedAya.id);
    this._ayaAudio = new Audio(url);
    this._ayaAudio.play();
  }

  showTafseer(): void {
    if (!this.selectedAya) return;
    this.tafseerOpen = true;
    this._fetchTafseer();
  }

  selectTafseerEdition(id: string): void {
    this.tafseerEdition = id;
    this._fetchTafseer();
  }

  closeTafseer(): void {
    this.tafseerOpen = false;
    this.tafseerText = '';
  }

  private _fetchTafseer(): void {
    if (!this.selectedAya) return;
    this.tafseerLoading = true;
    this.tafseerText = '';
    this._http
      .get<any>(`https://api.alquran.cloud/v1/ayah/${this.selectedAya.id}/${this.tafseerEdition}`)
      .subscribe({
        next: res => {
          this.tafseerText = res?.data?.text ?? 'لا يوجد تفسير متاح.';
          this.tafseerLoading = false;
        },
        error: () => {
          this.tafseerText = 'حدث خطأ أثناء تحميل التفسير.';
          this.tafseerLoading = false;
        }
      });
  }

  confirmBookmark(): void {
    this._bookmarkService.saveBookmark(this.selectedAya, this.bookmarkNote);
    this.showBookmarkDialog = false;
  }


  loadQuranPages(): void {
    const processPages = (response: any) => {
      this._quranPages = response;

      // Populate textNoTashkeel on slide.ayat so buildMushafLines can use NT word positions
      this._quranPages.forEach((pg: any) => {
        const slide = this.quranPages.find((s: any) => s.pageNumber === pg.pageNumber);
        if (!slide) return;
        pg.ayas.forEach((qAya: any) => {
          // qAya.id is a number, slideAya.id is a string — use string equality
          const slideAya = slide.ayat.find((a: any) => String(a.id) === String(qAya.id));
          if (slideAya) slideAya.textNoTashkeel = qAya.text_without_tashkeel;
        });
      });

      // Process colors for ALL pages so every slide has arrOfColoredWords
      for (let p = 1; p <= this._quranPages.length; p++) {
        this.resetDrawing();
        this.generateMotashabehatOfSelectedPage(p);
        this.determineHighlight();
      }

      this.colorsRendered = true;

      // Render current page only — other pages build on demand when navigated to
      this.renderPage(this.pageNumber);
    };

    if (this._printService.quranPagesData.length) {
      // Cache hit — skip HTTP, run computation immediately
      processPages(this._printService.quranPagesData);
    } else {
      this._http.get<any>(QuranPagesURL).subscribe((response) => {
        this._printService.quranPagesData = response; // cache for next navigation
        processPages(response);
      });
    }

    if (this._printService.pagesWithLines.length) {
      // Cache hit — reuse without HTTP
      this._pagesWithLines = this._printService.pagesWithLines;
      if (this.colorsRendered) this.buildMushafLinesForCurrentPage();
    } else if (!this._pagesWithLines.length) {
      this._http.get<any[]>(QuranPagesWithLinesURL).subscribe((data) => {
        this._pagesWithLines = data;
        this._printService.pagesWithLines = data; // cache for next navigation
        if (this.colorsRendered) this.buildMushafLinesForCurrentPage();
      });
    }
  }

  loadQuranJson(): void {
    // Show page-nav spinner for BOTH paths:
    // - Cache hit: no HTTP so the default interceptor spinner never fires
    // - Non-cache: HTTP interceptor covers the download, but hides BEFORE the
    //   heavy CPU work (processPages loop); page-nav stays up through that too
    this._spinner.show('page-nav');

    if (this._printService.quranInJson) {
      this._quranInJson = this._printService.quranInJson;
      this.loadQuranPages();
      return;
    }
    this._http.get<any>(QuranInJsonURL).subscribe((response) => {
      this._quranInJson = response;
      this._printService.quranInJson = response; // cache for next navigation
      this.loadQuranPages();
    });
  }

  findSuras(sura: string): boolean {
    let index = this.suras.indexOf(sura);
    return index >= 0;
  }

  onAyaClick($event: any): void {
    this.selectedAyaId = $event.ayaId;
    this.onClick.emit($event);
    this.selectedAyaIndex = this.allAyas.findIndex(
      (aya) => aya.id === parseInt($event.ayaId, 10)
    );

    if (this.selectedAyaIndex >= 0) {
      if (
        this.allAyas[this.selectedAyaIndex].errorFactor !== $event.errorFactor
      ) {
        this.allAyas[this.selectedAyaIndex].errorFactor = $event.errorFactor;
        this.resetDrawing();
        this.generateMotashabehatOfSelectedPage(this.pageNumber);
        this.determineHighlight();
        this.drawColoredWords();
      }
      let index = this.inputs.findIndex((aya) => aya.ayaId === $event.ayaId);
      if (index >= 0) {
        this.inputs[index].isActive = !this.inputs[index].isActive;
      }
    }
  }

  maximizeHighlightedAya(): void {
    if (this.selectedAyaIndex >= 0) {
      let aya = this.allAyas[this.selectedAyaIndex];
      if (aya.errorFactor !== "") {
        let [operation, factorStr] = aya.errorFactor.split(" ");
        let factor = parseInt(factorStr, 10);
        factor = operation === "+" ? factor + 1 : factor - 1;
        this.allAyas[
          this.selectedAyaIndex
        ].errorFactor = `${operation} ${factor}`;
      } else {
        this.allAyas[this.selectedAyaIndex].errorFactor = "+ 1";
      }
    }
  }

  minimizeHighlightedAya(): void {
    if (this.selectedAyaIndex >= 0) {
      let aya = this.allAyas[this.selectedAyaIndex];
      if (aya.errorFactor !== "") {
        let [operation, factorStr] = aya.errorFactor.split(" ");
        let factor = parseInt(factorStr, 10);
        factor = operation === "+" ? factor + 1 : factor - 1;
        this.allAyas[
          this.selectedAyaIndex
        ].errorFactor = `${operation} ${factor}`;
      } else {
        this.allAyas[this.selectedAyaIndex].errorFactor = "- 1";
      }
    }
  }


  onMotahabehClick($event: any): void {
    this.motahabehClick.emit($event);
  }

  EmitColorChange(): void {
    this.resetDrawing();
    this.generateMotashabehatOfSelectedPage(this.pageNumber);
    this.determineHighlight();
    this.drawColoredWords();
  }

  private resetDrawing(): void {
    this.lastTop = 10;
    this.marginTop = 20;
    this.inputs = [];
    this.isNextAyaLeft = false;
    this.isShiftedVertically = false;
    this.arrOfAyaWords = [];
    this.motashabehatSpans = [];
    this.lastTopRight = 0;
    this.lastTopLeft = 0;
    this.spansOfColoredWords = [];
    this.searchWord = "";
    this.x = [];
    this.allAyas = [];
    // this.colorsRendered = false;

  }
  
  /** Counts how many leading words two word lists share, starting from index 0 */
  private countSharedLeadingWords(sourceWords: string[], candidateWords: string[]): number {
    const len = Math.min(sourceWords.length, candidateWords.length);
    let count = 0;
    for (let i = 0; i < len; i++) {
      if (sourceWords[i] !== candidateWords[i]) break;
      count++;
    }
    return count;
  }

  /** Strongest match first, mushaf order (sura then aya) as tiebreaker */
  private sortMoade3ByMatchThenMushafOrder(
    arr: { matchScore?: number; suraIndex?: number; ayaIndex?: number }[]
  ): void {
    arr.sort((a, b) =>
      (b.matchScore ?? 0) - (a.matchScore ?? 0) ||
      (a.suraIndex ?? 0) - (b.suraIndex ?? 0) ||
      (a.ayaIndex ?? 0) - (b.ayaIndex ?? 0)
    );
  }

  private generateMotashabehatOfSelectedPage(pageNumber: number): void {
    this._quranPages[pageNumber - 1].ayas.forEach((ayaInPage: any) => {
      this.arrOfAyaWords = ayaInPage.text_without_tashkeel.split(" ");
      this.searchWord = this.arrOfAyaWords[0];
      let isCheckIn = false;
      let ayaDetails: AllAya = {
        arrOfColoredWords: [],
        errorFactor: "",
        top: "",
        id: 0,
        mooade3: [],
        suraWithIndex: "",
        matchedWord: '',
        sura: "",
        aya: "",
        ayaIndex: 0,
        numOfCharsInWholeAya: 0,
      };
      let arrayOfMot: {
        id: number;
        suraWithIndex: string;
        aya: string;
        color: string;
        matchScore?: number;
        suraIndex?: number;
        ayaIndex?: number;
      }[] = [];
      let arrayOfWordsWithColors: ArrOfColoredWords[] = [];

      for (let i = 0; i < this.arrOfAyaWords.length; i++) {
        this.x = [];
        let countSuras: any[] = [];

        if (i === 0) {
          this.searchWord = this.arrOfAyaWords[0];
        } else {
          this.searchWord = this.searchWord + " " + this.arrOfAyaWords[i];
        }

        this._quranInJson.forEach((sura: any) => {
          sura.aya.forEach((aya: any) => {
            if (aya.text_without_tashkeel === this.searchWord || aya.text_without_tashkeel.startsWith(this.searchWord + ' ')) {
              const matchScore = this.countSharedLeadingWords(
                this.arrOfAyaWords,
                aya.text_without_tashkeel.split(" ")
              );
              this.x.push({
                id: ayaInPage.id,
                errorFactor: ayaInPage.errorFactor,
                top: ayaInPage.top,
                text: aya.text_without_tashkeel,
                index: aya.index,
                suraIndex: sura.index,
                matchScore,
                suraWithIndex: `${sura.name} (${aya.index})`,
                sura: sura.name,
                lastWord: this.arrOfAyaWords[i],
              });
              if (countSuras.indexOf(sura.name) < 0) {
                countSuras.push(sura.name);
              }
            }
          });
        });

        if (this.x.length === 1) {
          arrayOfWordsWithColors.push({
            word: this.x[0].lastWord,
            color:
              arrayOfWordsWithColors.length === 0
                ? this.colors[0].color
                : this.colors[5].color,
          });
          if (!isCheckIn) {
            ayaDetails = {
              errorFactor: this.x[0].errorFactor,
              top: this.x[0].top,
              id: this.x[0].id,
              aya: this.x[0].text,
              numOfCharsInWholeAya: this.x[0].text.length,
              ayaIndex: this.x[0].index,
              arrOfColoredWords: arrayOfWordsWithColors,
              sura: this.x[0].sura,
              suraWithIndex: this.x[0].suraWithIndex,
              mooade3: arrayOfMot,
              matchedWord: this.x[0].lastWord
            };
            isCheckIn = true;
          } else {
            ayaDetails.arrOfColoredWords = arrayOfWordsWithColors;
          }
          break;
        } else if (this.x.length === 2) {
          arrayOfWordsWithColors.push({
            word: this.x[0].lastWord,
            color: this.colors[1].color,
          });
          if (!isCheckIn) {
            this.x.forEach((mode3) => {
              arrayOfMot.push({
                id: mode3.id,
                suraWithIndex: mode3.suraWithIndex,
                aya: mode3.text,
                color: "",
                matchScore: mode3.matchScore,
                suraIndex: mode3.suraIndex,
                ayaIndex: mode3.index,
              });
            });
            this.sortMoade3ByMatchThenMushafOrder(arrayOfMot);
            ayaDetails = {
              errorFactor: this.x[0].errorFactor,
              top: this.x[0].top,
              id: this.x[0].id,
              aya: this.x[0].text,
              numOfCharsInWholeAya: this.x[0].text.length,
              ayaIndex: this.x[0].index,
              sura: this.x[0].sura,
              suraWithIndex: this.x[0].suraWithIndex,
              arrOfColoredWords: arrayOfWordsWithColors,
              mooade3: arrayOfMot,
              matchedWord: this.x[0].lastWord
            };
            isCheckIn = true;
          } else {
            ayaDetails.arrOfColoredWords = arrayOfWordsWithColors;
          }
        } else if (this.x.length == 3) {
          arrayOfWordsWithColors.push({
            word: this.x[0].lastWord,
            color: this.colors[2].color,
          });

          if (!isCheckIn) {
            this.x.forEach((mode3) => {
              arrayOfMot.push({
                id: mode3.id,
                suraWithIndex: mode3.suraWithIndex,
                aya: mode3.text,
                color: "",
                matchScore: mode3.matchScore,
                suraIndex: mode3.suraIndex,
                ayaIndex: mode3.index,
              });
            });
            this.sortMoade3ByMatchThenMushafOrder(arrayOfMot);
            ayaDetails = {
              errorFactor: this.x[0].errorFactor,
              top: this.x[0].top,
              id: this.x[0].id,
              aya: this.x[0].text,
              numOfCharsInWholeAya: this.x[0].text.length,
              ayaIndex: this.x[0].index,
              sura: this.x[0].sura,
              suraWithIndex: this.x[0].suraWithIndex,
              arrOfColoredWords: arrayOfWordsWithColors,
              mooade3: arrayOfMot,
              matchedWord: this.searchWord
            };
            isCheckIn = true;
          } else {
            ayaDetails.arrOfColoredWords = arrayOfWordsWithColors;
          }
        } else if (this.x.length == 4) {
          arrayOfWordsWithColors.push({
            word: this.x[0].lastWord,
            color: this.colors[3].color,
          });

          if (!isCheckIn) {
            this.x.forEach((mode3) => {
              arrayOfMot.push({
                id: mode3.id,
                suraWithIndex: mode3.suraWithIndex,
                aya: mode3.text,
                color: "",
                matchScore: mode3.matchScore,
                suraIndex: mode3.suraIndex,
                ayaIndex: mode3.index,
              });
            });
            this.sortMoade3ByMatchThenMushafOrder(arrayOfMot);
            ayaDetails = {
              errorFactor: this.x[0].errorFactor,
              top: this.x[0].top,
              id: this.x[0].id,
              aya: this.x[0].text,
              numOfCharsInWholeAya: this.x[0].text.length,
              ayaIndex: this.x[0].index,
              sura: this.x[0].sura,
              suraWithIndex: this.x[0].suraWithIndex,
              arrOfColoredWords: arrayOfWordsWithColors,
              mooade3: arrayOfMot,
              matchedWord: this.searchWord
            };
            isCheckIn = true;
          } else {
            ayaDetails.arrOfColoredWords = arrayOfWordsWithColors;
          }
        } else if (this.x.length > 4) {
          arrayOfWordsWithColors.push({
            word: this.x[0].lastWord,
            color: this.colors[4].color,
          });
          if (countSuras.length <= this.suraCount || this.x.length <= this.similarCount) {
            //|| this.x.length <= this.NofMotashabeh
            if (!isCheckIn) {
              this.x.forEach((mode3) => {
                arrayOfMot.push({
                  id: mode3.id,
                  suraWithIndex: mode3.suraWithIndex,
                  aya: mode3.text,
                  color: "",
                  matchScore: mode3.matchScore,
                  suraIndex: mode3.suraIndex,
                  ayaIndex: mode3.index,
                });
              });
              this.sortMoade3ByMatchThenMushafOrder(arrayOfMot);
              ayaDetails = {
                errorFactor: this.x[0].errorFactor,
                top: this.x[0].top,
                id: this.x[0].id,
                aya: this.x[0].text,
                numOfCharsInWholeAya: this.x[0].text.length,
                ayaIndex: this.x[0].index,
                sura: this.x[0].sura,
                suraWithIndex: this.x[0].suraWithIndex,
                arrOfColoredWords: arrayOfWordsWithColors,
                mooade3: arrayOfMot,
                matchedWord: this.searchWord

              };
              isCheckIn = true;
            } else {
              ayaDetails.arrOfColoredWords = arrayOfWordsWithColors;
            }
          } else {
            ayaDetails.arrOfColoredWords = arrayOfWordsWithColors;
          }
        }
      }
      ayaDetails.matchedWord = this.getWordWithTashkeel(
        ayaInPage.text,
        ayaInPage.text_without_tashkeel,
        this.searchWord
      );
      // ayaDetails = this.addStaticMotashabehat(ayaInPage, ayaDetails);
      this.allAyas.push(ayaDetails);
    });
    console.log(`generated Ayas: ${JSON.stringify(this.allAyas)}`);
  }

  private getWordWithTashkeel(fullText: string, fullTextNoTashkeel: string, matchNoTashkeel: string): string {

    const index = fullTextNoTashkeel.indexOf(matchNoTashkeel);
  
    if (index === -1) {
      return matchNoTashkeel;
    }
  
    return fullText.slice(index, index + matchNoTashkeel.length);
  }

  
  private determineHighlight(): void {
    let ayasLines: number[] = [];
    this.allAyas.forEach((aya, index) => {
      if (aya.ayaIndex === 1) {
        this.marginTop = 95;
      } else if (index === 0) {
        this.marginTop = 23;
      }

      let ayaStart = this.marginTop;
      let numOfAyaChars = aya.numOfCharsInWholeAya;

      if (aya.errorFactor !== "") {
        let [operation, factorStr] = aya.errorFactor.split(" ");
        let factor = parseInt(factorStr, 10);
        numOfAyaChars =
          operation === "+" ? numOfAyaChars + factor : numOfAyaChars - factor;
      }

      let isFirst = true;
      let temp: number[] = [];

      if (numOfAyaChars < 86 && ayasLines[ayasLines.length - 1] > 75) {
        ayasLines = [numOfAyaChars];
        this.isNextAyaLeft = numOfAyaChars < 45;
      } else {
        while (numOfAyaChars >= 0) {
          if (isFirst) {
            temp = [];
            if (numOfAyaChars >= 86 && ayasLines[ayasLines.length - 1] === 86) {
              ayasLines = [];
            } else if (ayasLines[ayasLines.length - 1] < 86) {
              this.isNextAyaLeft = ayasLines[ayasLines.length - 1] > 45;
              temp = ayasLines;
              ayasLines = [];
              numOfAyaChars -= 86 - temp[temp.length - 1];
              ayasLines.push(86 - temp[temp.length - 1]);
              this.marginTop -= 43.75;
            }
          }
          if (numOfAyaChars >= 0) {
            if (numOfAyaChars >= 86) {
              ayasLines.push(86);
              numOfAyaChars -= 86;
            } else {
              if (temp.length > 0) {
                ayasLines.push(numOfAyaChars);
                if (numOfAyaChars < 86) {
                  break;
                }
              } else {
                ayasLines.push(numOfAyaChars);
                numOfAyaChars -= 86;
              }
            }
          } else {
            break;
          }
          isFirst = false;
        }
      }

      let spans: Span[] = [];
      for (let i = 0; i < ayasLines.length; i++) {
        let operationY = aya.top?.split(" ")[0];
        let factorY = aya.top?.split(" ")[1];
        if (aya.top && operationY === "+") {
          this.marginTop += parseInt(factorY, 10);
        } else if (aya.top && operationY === "-") {
          this.marginTop -= parseInt(factorY, 10);
        }

        spans.push({
          aya: aya.aya,
          top: `${this.marginTop}px`,
          left:
            temp.length !== 0
              ? i === 0
                ? "39px"
                : `${39 + (86 - ayasLines[i]) * 5}px`
              : `${39 + (86 - ayasLines[i]) * 5}px`,
          width: `${ayasLines[i] * 5}px`,
          height: "35px",
        });
        if (i === ayasLines.length - 1 || i === 0 || ayasLines[i] === 86) {
          this.marginTop += 43.75;
        }
        this.isShiftedVertically = i === ayasLines.length - 1;
      }
      let ayaEnd = this.marginTop;
      this.motashabehatSpans = [];

      this.inputs.push({
        motashabehat: {
          id:aya.id,
          top: "",
          height: "",
          isRight: this.isNextAyaLeft,
          moade3: [],
        },
        ayat: [],
        aya: aya.aya,
        ayaId: aya.id.toString(),
        isActive: this.selectedAyaId === aya.id,
        href: `#${aya.ayaIndex}`,
        activeAya: aya.ayaIndex,
        spans: spans,
        motashabehatSpans: [],
        spansOfColoredWords: [],
        errorFactor: aya.errorFactor,
        matchedWord: aya.matchedWord,
        arrOfColoredWords: aya.arrOfColoredWords
      });
      this.drawMotashabehat(aya, ayaStart, ayaEnd);
    });

    this.inputs.forEach(input => {
  const pageAya = this.quranPages
    .flatMap(p => p.ayat)
    .find(a => a.id.toString() === input.ayaId);

  if (pageAya) {
    pageAya.matchedWord = input.matchedWord;
    pageAya.arrOfColoredWords = input.arrOfColoredWords;
    pageAya.motashabehat = input.motashabehat;
  }
});

    // Emit happens after buildMushafLines so _lineIdx is populated
  }

  private drawMotashabehat(
    aya: AllAya,
    ayaStart: number,
    ayaEnd: number
  ): void {
    let index = this.allAyas.indexOf(aya);
    if (aya.mooade3.length > 0) {
      this.lastTopLeft = 0;
      this.fillRightArrayFirst(index, aya.mooade3, ayaStart, ayaEnd,aya);
      this.addMoade3(index, aya.mooade3, ayaStart, ayaEnd);
      if (this.allAyas[index].mooade3.length > 0) {
        let ayat = this.allAyas[index].mooade3.map((m) => m.aya);
        this.inputs[index].ayat = ayat;
      }
    }
  }

  private drawColoredWords(): void {
    for (let j = 0; j < this.allAyas.length; j++) {
      this.spansOfColoredWords = [];
      let lastWord = '';
      let previousColor = "";
      let left = 0;
      let top = '';
      if (
        this.inputs[j] &&
        this.inputs[j].spans &&
        this.inputs[j].spans.length > 0 &&
        this.inputs[j].spans[0].left != null &&
        this.inputs[j].spans[0].width != null
      ) {
        left =
          parseInt(this.inputs[j].spans[0].left, 10) +
          parseInt(this.inputs[j].spans[0].width, 10);

        // Continue using `left` and `top` here...
      } else {
        console.warn(`Invalid input at index ${j}`, this.inputs[j]);
      }

      const span = this.inputs[j]?.spans?.[0];

      if (span?.top) {
        top = span.top.split("px")[0];
        // use top here
      } else {
        console.warn(`Missing top value for span at index ${j}`, span);
      }
      for (let i = 0; i < this.allAyas[j].arrOfColoredWords.length; i++) {
        let width = 0;
        let space =
          previousColor === this.allAyas[j].arrOfColoredWords[i].color ? 0 : 2;

        if (i === 0) {
          width =
            (this.allAyas[j]?.arrOfColoredWords?.[i]?.word?.length ?? 0) * 5;
          left -= width;
          this.spansOfColoredWords.push({
            top: `${parseInt(top, 10) + 35}px`,
            color: this.allAyas[j].arrOfColoredWords[i].color,
            width: `${width}px`,
            left: `${left}px`,
            coloredWord: lastWord,
            isStatic: this.allAyas[j].arrOfColoredWords[i].isStatic,
          });
          lastWord = this.allAyas[j].arrOfColoredWords[0].word;
        } else {
          let currentWord =
            this.allAyas[j]?.arrOfColoredWords?.[i]?.word?.split(
              lastWord ?? ""
            )?.[1] ?? "";

          if (currentWord !== undefined) {
            width = currentWord.length * 5;
          } else {
            width =
              (this.allAyas[j]?.arrOfColoredWords?.[i]?.word?.length ?? 0) * 5;
            if (
              (this.allAyas[j]?.arrOfColoredWords?.[i]?.word ?? "") !== "" &&
              (this.allAyas[j]?.arrOfColoredWords?.[i]?.word?.length ?? 0) >
              2 &&
              (this.inputs[j]?.spans?.length ?? 0) >
              (this.allAyas[j]?.arrOfColoredWords?.[i]?.lineIndex ?? 0)
            ) {
              const lineIndex =
                this.allAyas[j]?.arrOfColoredWords?.[i]?.lineIndex ?? 0;
              top = this.inputs[j]?.spans?.[lineIndex]?.top ?? "";

              left = parseInt(
                this.allAyas[j].arrOfColoredWords[i].left || "0",
                10
              );
            }
          }
          if (currentWord !== undefined) {
            if (left - width - space > 50) {
              left = left - width - space;
              this.spansOfColoredWords.push({
                top: `${parseInt(top, 10) + 35}px`,
                color: this.allAyas[j].arrOfColoredWords[i].color,
                width: `${width}px`,
                left: `${left}px`,
                coloredWord: lastWord,
                isStatic: this.allAyas[j].arrOfColoredWords[i].isStatic,
              });
            } else {
              top = this.inputs[j].spans[1]
                ? this.inputs[j].spans[1].top.split("px")[0]
                : "0";
              left = this.inputs[j].spans[1]
                ? parseInt(this.inputs[j].spans[1].left, 10) +
                parseInt(this.inputs[j].spans[1].width, 10) -
                width -
                space
                : 0;
              this.spansOfColoredWords.push({
                top: `${parseInt(top, 10) + 35}px`,
                color: this.allAyas[j].arrOfColoredWords[i].color,
                width: `${width}px`,
                left: `${left}px`,
                coloredWord: lastWord,
                isStatic: this.allAyas[j].arrOfColoredWords[i].isStatic,
              });
            }
          } else {
            left = left - width - space;
            this.spansOfColoredWords.push({
              top: `${parseInt(top, 10) + 35}px`,
              color: this.allAyas[j].arrOfColoredWords[i].color,
              width: `${width}px`,
              left: `${left}px`,
              coloredWord: lastWord,
              isStatic: this.allAyas[j].arrOfColoredWords[i].isStatic,
            });
          }

          lastWord = this.allAyas[j].arrOfColoredWords[i].word;
        }
        previousColor = this.allAyas[j].arrOfColoredWords[i].color;
      }
      this.inputs[j].spansOfColoredWords = this.spansOfColoredWords;
    }
    this.colorsRendered = true;
    this.buildMushafLinesForCurrentPage();
  }

  /** Like drawColoredWords but only maps colors to slide ayat — no positioning or mushaf rebuild */
  private drawColoredWordsForPage(): void {
    this.inputs.forEach(input => {
      const pageAya = this.quranPages
        .flatMap((p: any) => p.ayat)
        .find((a: any) => a.id.toString() === input.ayaId);
      if (pageAya) {
        pageAya.matchedWord = input.matchedWord;
        pageAya.arrOfColoredWords = input.arrOfColoredWords;
        pageAya.motashabehat = input.motashabehat;
      }
    });
  }

  private fillRightArrayFirst(
    index: number,
    mooade3: { suraWithIndex: string; aya?: string; id: number }[],
    ayaStart: number,
    ayaEnd: number,
    aya:AllAya
  ): number {
    let rightArr = "";
    for (let i = 0; i < mooade3.length; i++) {
      this.lastTopRight += 30;
      if (this.lastTopRight < ayaEnd + 10) {
        rightArr = rightArr + mooade3[i].suraWithIndex + "";
        let top = index === 0 ? ayaStart : ayaStart - 30;
        if (i === mooade3.length - 1) {
          this.motashabehatSpans.push({
            id: aya.id,
            highlighted: false,
            top: `${top}px`,
            isRight: this.isNextAyaLeft,
            moade3: rightArr,
            height: `${ayaEnd - ayaStart - 15}px`,
          });
          this.inputs[index].motashabehatSpans = this.motashabehatSpans;
        }
      } else {
        this.motashabehatSpans.push({
          id: aya.id,
          highlighted: false,
          top: `${ayaStart}px`,
          isRight: this.isNextAyaLeft,
          moade3: rightArr,
          height: `${ayaEnd - ayaStart - 30}px`,
        });
        this.inputs[index].motashabehatSpans = this.motashabehatSpans;
        return i;
      }
    }
    return 0;
  }

  private addMoade3(
    index: number,
    moade3: {
      suraWithIndex: string;
      aya?: string;
      id: number;
      color: string;
    }[],
    ayaStart: number,
    ayaEnd: number
  ): void {
    let motashabehat: Motashabehat = {
      id: index,
      top: "",
      height: "",
      isRight: this.isNextAyaLeft,
      moade3: [],
    };
    let arr = moade3.map((m, idx) => ({
      top: `${this.lastTop + idx * 25}px`,
      suraWithIndex: m.suraWithIndex,
      aya: m.aya,
      id: m.id,
      color: m.color,
    }));
    if (arr.length > 0) {
      motashabehat.height = `${parseInt(arr[arr.length - 1].top, 10) + 25 - parseInt(arr[0].top, 10)
        }px`;
      motashabehat.moade3 = arr;
      this.inputs[index].motashabehat = motashabehat;
    }
  }

  underlineMatchedWord(
    text: string,
    matchedWord?: string,
    color?: string
  ): string {
    if(!color || color=='' || color== '#15803d') return '';
    if (!matchedWord) return text;
  
    const trimmedMatch = this.removeLastWord(matchedWord);
    if (!trimmedMatch) return text;
  
    const index = text.indexOf(trimmedMatch);
    if (index === -1) return text;
  
    const before = text.slice(0, index);
    const match = text.slice(index, index + trimmedMatch.length);
    const after = text.slice(index + trimmedMatch.length);
    // Color color = #00FF00;
    return `
      ${before}
      <span class="matched-underline" style="--underline-color:#00FF00"      >
        ${match}
      </span>
      ${after}
    `;
  }
  
  
  
  // ── Quick Go To ─────────────────────────────────────────────────────────────

  navigateToPage(page: number): void {
    const idx = this.pageToSlideIndex.get(page);
    if (idx === undefined) return;
    this.carousel.to((idx + 1).toString());
    this.goToOpen = false;
    this.lastPageProcessed = page;
    // Show named spinner, wait two rAF frames so the browser paints the overlay
    // before the synchronous render pipeline blocks the thread
    this._spinner.show('page-nav');
    requestAnimationFrame(() => requestAnimationFrame(() => this.renderPage(page)));
  }

  prevPage(): void {
    if (this.pageNumber > 1) this.navigateToPage(this.pageNumber - 1);
  }

  nextPage(): void {
    if (this.pageNumber < 604) this.navigateToPage(this.pageNumber + 1);
  }

  navigateToSura(suraIndex: number | string): void {
    const n = Number(suraIndex);
    const row = this._searchInstance.table_othmani.find(
      (r: any) => Number(r.nOFSura) === n
    );
    if (!row) return;
    this.navigateToPage(Number(row.nOFPage));
  }

  navigateToAya(suraIndex: number | string, ayaIndex: number | string): void {
    const sn = Number(suraIndex);
    const an = Number(ayaIndex);
    const row = this._searchInstance.table_othmani.find(
      (r: any) => Number(r.nOFSura) === sn && Number(r.Aya_N) === an
    );
    if (!row) return;
    this.navigateToPage(Number(row.nOFPage));
  }

  get selectedSuraAyaCount(): number {
    return this.suraList.find(s => s.index === Number(this.goToSuraIndex))?.ayaCount ?? 1;
  }

  setGoToMode(mode: 'page' | 'sura' | 'aya'): void {
    this.goToMode = mode;
  }

  onGoToSubmit(): void {
    if (this.goToMode === 'page') {
      this.navigateToPage(Number(this.goToPage));
    } else if (this.goToMode === 'sura') {
      this.navigateToSura(Number(this.goToSuraIndex));
    } else {
      this.navigateToAya(Number(this.goToSuraIndex), Number(this.goToAyaIndex));
    }
    this.goToOpen = false;
  }

  // ── Slideshow ────────────────────────────────────────────────────────────────

  toggleSlideshow(): void {
    this.slideshowPlaying ? this.pauseSlideshow() : this.playSlideshow();
  }

  playSlideshow(): void {
    this.slideshowPlaying = true;
    this.slideshowTimer = setInterval(() => {
      const next = this.pageNumber < 604 ? this.pageNumber + 1 : 1;
      this.navigateToPage(next);
    }, this.slideshowSpeed);
  }

  pauseSlideshow(): void {
    this.slideshowPlaying = false;
    clearInterval(this.slideshowTimer);
    this.slideshowTimer = null;
  }

  onSlideshowSpeedChange(): void {
    if (this.slideshowPlaying) {
      this.pauseSlideshow();
      this.playSlideshow();
    }
  }

  ngOnDestroy(): void {
    this.pauseSlideshow();
  }

  // ── Mushaf line rendering ───────────────────────────────────────────────────

  /** Build mushaf lines for ALL pages (called once after all colors are ready) */
  private buildAllMushafLines(): void {
    if (!this._pagesWithLines.length) return;
    this.quranPages.forEach(slide => {
      const pageData = this._pagesWithLines[slide.pageNumber - 1];
      if (!pageData || !pageData.lines) return;
      this.buildMushafLines(slide, pageData.lines);
    });
  }

  /** Rebuild mushaf lines for the current page only (after color recalculation) */
  private buildMushafLinesForCurrentPage(): void {
    if (!this._pagesWithLines.length) {
      // Full JSON not loaded yet — use per-page fast loader as fallback
      this.loadPageQuick(this.pageNumber);
      return;
    }
    const slide = this.quranPages.find((s: any) => s.pageNumber === this.pageNumber);
    if (!slide) return;
    const pageData = this._pagesWithLines[slide.pageNumber - 1];
    if (!pageData || !pageData.lines) return;
    this.buildMushafLines(slide, pageData.lines);
  }

  private buildMushafLines(slide: any, lines: any[]): void {
    // Build lookup keyed by "sura:aya" (verseKey) across ALL suras on this page
    const ayaLookup = new Map<string, any>();
    slide.ayat.forEach((aya: any) => {
      const key = aya.suraNumber + ':' + aya.ayaNumber;
      ayaLookup.set(key, aya);
    });

    // Pre-compute the last line index that contains each verseKey
    const lastLineForVerse = new Map<string, number>();
    lines.forEach((line: any, li: number) => {
      line.segments.forEach((seg: any) => {
        lastLineForVerse.set(seg.verseKey, li);
      });
    });

    // consumed tracks NT (text_without_tashkeel) word positions — matches wordPositions in lines JSON
    const consumed = new Map<string, number>();
    const mushafLines: any[] = [];

    lines.forEach((line: any, li: number) => {
      const lineSegments: any[] = [];

      line.segments.forEach((seg: any) => {
        const aya = ayaLookup.get(seg.verseKey);
        if (!aya) return;

        // Use NT words for position tracking (aligns with wordPositions in lines JSON)
        const ntWords: string[] = (aya.textNoTashkeel || this.stripTashkeel(aya.text)).split(' ');
        const coloredWords: any[] = aya.arrOfColoredWords || [];
        const from = consumed.get(seg.verseKey) || 0;
        const isLastSegment = lastLineForVerse.get(seg.verseKey) === li;

        const to = isLastSegment ? ntWords.length : Math.min(from + seg.wordPositions.length, ntWords.length);
        consumed.set(seg.verseKey, to);

        if (from >= ntWords.length) {
          // All words consumed — this slot is the aya-end ornament position
          if (isLastSegment) {
            lineSegments.push({ aya, lineText: '', lineGroups: [], isAyaEnd: true });
          }
          return;
        }

        // Build display map: NT index → Othmani display word
        // Handles merged يا forms (1 Othmani word = 2 NT words)
        const displayMap = this.buildDisplayWordMap(aya.text, ntWords);

        // arrOfColoredWords is an ORDERED sparse list (only colored words in
        // their occurrence order). Map each coloredWord to the next unmatched NT
        // position whose normalized text matches — so repeated words like "قال"
        // only get colored at the position that appears in the coloredWords list.
        const colorByNTIndex = new Map<number, string>();
        {
          const ntNorm = ntWords.map((w: string) => this.normalizeForWordMapping(w));
          let searchFrom = 0;
          coloredWords.forEach((cw: any) => {
            if (!cw?.word || !cw?.color || cw.color === '#000000') return;
            const target = this.normalizeForWordMapping(cw.word);
            for (let j = searchFrom; j < ntNorm.length; j++) {
              if (colorByNTIndex.has(j)) continue;
              if (ntNorm[j] === target) {
                colorByNTIndex.set(j, cw.color);
                searchFrom = j + 1;
                break;
              }
            }
          });
        }
        const lookupColor = (ntIdx: number): string => colorByNTIndex.get(ntIdx) || '';

        const lineGroups: { color: string; words: string[] }[] = [];
        for (let i = from; i < to; i++) {
          const display = displayMap[i];
          if (!display) continue; // null = second half of merged يا, skip

          let color: string;
          if (displayMap[i + 1] === null) {
            color = lookupColor(i + 1) || lookupColor(i);
          } else {
            color = lookupColor(i);
          }

          const cleanWord = this.stripQuranicMarks(display);

          // Group consecutive same-color words so the outer span carries an
          // unbroken underline, while inner per-word spans preserve uniform
          // word spacing (browser-justified).
          const last = lineGroups[lineGroups.length - 1];
          if (last && color && last.color === color) {
            last.words.push(cleanWord);
          } else {
            lineGroups.push({ color, words: [cleanWord] });
          }
        }

        lineSegments.push({ aya, lineText: '', lineGroups, isAyaEnd: isLastSegment });
      });

      // Determine sura name for sura-start lines
      let suraName = '';
      let suraNumber = 0;
      let suraAyaCount = 0;
      if (line.isSuraStart && line.segments.length) {
        suraNumber = Number(line.segments[0].verseKey.split(':')[0]);
        const aya = slide.ayat.find((a: any) => a.suraNumber === suraNumber);
        suraName = aya?.suraName || '';
        suraAyaCount = this.suraList.find(s => s.index === suraNumber)?.ayaCount ?? 0;
      }

      if (lineSegments.length) {
        mushafLines.push({
          segments: lineSegments,
          isCentered: line.isSuraStart || line.isBasmala,
          isSuraStart: !!line.isSuraStart,
          isBasmala: !!line.isBasmala,
          suraName,
          suraNumber,
          suraAyaCount
        });
      }
    });

    slide.mushafLines = mushafLines;
    slide.juzNumber = this.getJuzForPage(slide.pageNumber);
    // Primary sura on this page = first aya's sura name
    slide.pageSuraName = slide.ayat?.[0]?.suraName ?? '';
    this._printService.quranPages = this.quranPages;

    // Track first/last mushaf line index for each aya — used by connected highlight box
    const ayaFirstLine = new Map<any, number>();
    const ayaLastLine  = new Map<any, number>();
    mushafLines.forEach((ml: any, idx: number) => {
      ml.segments.forEach((seg: any) => {
        if (!ayaFirstLine.has(seg.aya)) ayaFirstLine.set(seg.aya, idx);
        ayaLastLine.set(seg.aya, idx);
      });
    });
    ayaFirstLine.forEach((lineIdx, aya) => { aya._hlFirstLine = lineIdx; });
    ayaLastLine.forEach((lineIdx, aya)  => { aya._hlLastLine  = lineIdx; });

    // Build alignment metadata for side boxes
    // Sura-start lines add an extra ~84px (h-16=64 + mt-2=8 + mb-3=12) above their text line
    const SURA_HEADER_EXTRA_PX = 84;
    const ayaLineIdx    = new Map<string, number>();
    const ayaStartsRight = new Map<string, boolean>();
    const lineExtraTop: number[] = [];
    let headerCount = 0;

    mushafLines.forEach((ml: any, idx: number) => {
      lineExtraTop.push(headerCount * SURA_HEADER_EXTRA_PX);
      if (ml.isSuraStart) headerCount++;

      const segWordCount = (seg: any): number =>
        (seg.lineGroups || []).reduce((s: number, g: any) => s + (g.words?.length ?? 0), 0) || 1;
      const totalWords = ml.segments.reduce(
        (sum: number, seg: any) => sum + segWordCount(seg), 0
      );
      let wordsBefore = 0;
      ml.segments.forEach((seg: any, si: number) => {
        const id = seg.aya?.id?.toString();
        if (id && !ayaLineIdx.has(id)) {
          ayaLineIdx.set(id, idx);
          ayaStartsRight.set(id, totalWords === 0 || wordsBefore / totalWords < 0.5);
        }
        wordsBefore += segWordCount(seg);
      });
    });

    const total = mushafLines.length;
    this.inputs.forEach((inp: any) => {
      const li = ayaLineIdx.get(inp.ayaId);
      if (li !== undefined) {
        inp._lineIdx      = li;
        inp._totalLines   = total;
        inp._extraTopPx   = lineExtraTop[li] ?? 0;
        inp._startsRight  = ayaStartsRight.get(inp.ayaId) ?? true;

        // Copy _startsRight to the aya object so print component can read it
        const pageAya = slide.ayat.find((a: any) => a.id.toString() === inp.ayaId);
        if (pageAya) pageAya._startsRight = inp._startsRight;
      }
    });

    if (this.inputs.length) this.motshabehat.emit(this.inputs);
    // Spinner is hidden by home.component after onMotshbehatGenerated renders the boxes
  }

  /**
   * Maps each NT (text_without_tashkeel) word position to an Othmani display word.
   * Handles merged يا forms where 1 Othmani word = 2 NT words:
   *   NT[i]="يا", NT[i+1]="قوم" → Othmani[j]="يَٰقَوْمِ"
   *   displayMap[i] = "يَٰقَوْمِ", displayMap[i+1] = null (skip in rendering)
   */
  private buildDisplayWordMap(othmaniText: string, ntWords: string[]): (string | null)[] {
    const othmaniWords = othmaniText.split(' ');
    const displayMap: (string | null)[] = [];
    let oIdx = 0;

    for (let ni = 0; ni < ntWords.length; ni++) {
      if (oIdx >= othmaniWords.length) {
        displayMap.push(ntWords[ni]);
        continue;
      }
      const ow = othmaniWords[oIdx];
      const nOW  = this.normalizeForWordMapping(ow);
      const nNT1 = this.normalizeForWordMapping(ntWords[ni]);
      const nNT2 = ni + 1 < ntWords.length ? this.normalizeForWordMapping(ntWords[ni + 1]) : '';

      // Collapse alefs at the NT1/NT2 join too (e.g. "يا"+"ايها" → "ياايها" → "يايها")
      const nNTJoin = (nNT1 + nNT2).replace(/\u0627{2,}/g, '\u0627');

      if (nNT2 && nOW === nNTJoin) {
        // Merged يا: 1 Othmani word covers 2 NT words
        displayMap.push(ow);   // first NT position → show Othmani merged word
        displayMap.push(null); // second NT position → renders nothing
        ni++;                   // consume both NT words
        oIdx++;
      } else {
        // 1-to-1 match or fallback
        displayMap.push(ow);
        oIdx++;
      }
    }

    return displayMap;
  }

  /** Normalise Arabic text for word-boundary comparison (strip diacritics, unify alef/ya/ta-marbuta forms, remove tatweel) */
  private normalizeForWordMapping(text: string): string {
    return text
      .replace(/[\u064B-\u065F\u0653\u0654\u0655]/g, '') // tashkeel + maddah/hamza marks
      .replace(/\u0670/g, 'ا')                            // superscript alef → ا
      .replace(/[\u0622\u0623\u0625\u0671]/g, 'ا')       // alef forms → ا
      .replace(/\u0649/g, '\u064A')                       // alef maksura ى → ya ي
      .replace(/\u0629/g, '\u0647')                       // ta marbuta ة → ha ه
      .replace(/\u0640/g, '')                              // tatweel
      .replace(/[\u06D6-\u06FF]/g, '')                    // Quranic annotation marks
      .replace(/\u0627{2,}/g, '\u0627');                  // collapse repeated alefs (e.g. dagger alef + hamza-on-alef → single ا)
  }

  private stripTashkeel(text: string): string {
    return text.replace(/[\u064B-\u065F]/g, '');
  }

  /** Remove Quranic annotation marks that render as black bubbles (U+06DF, U+06E2, U+06E5, U+06E6, U+06ED) */
  stripQuranicMarks(text: string): string {
    return text.replace(/[\u06DF\u06E2\u06E5\u06E6\u06ED]/g, '');
  }
  
  private removeLastWord(text: string): string {
    const parts = text.trim().split(/\s+/);
  
    // لو كلمة واحدة → نشيلها كلها
    if (parts.length <= 1) {
      return '';
    }
  
    // غير كده نشيل آخر كلمة
    return parts.slice(0, -1).join(' ');
  }
  
  
}
