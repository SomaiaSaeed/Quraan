import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation,AfterViewInit } from "@angular/core";
import { CarouselComponent, OwlOptions, SlidesOutputData } from "ngx-owl-carousel-o";
import { MenuItem } from "primeng/api";
import { ContextMenu } from "primeng/contextmenu";
import { BookmarkService } from "src/app/core/services/bookmark.service";
import { Search } from "src/app/core/services/search.service";


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
export class QuraanImagesComponent implements OnInit,AfterViewInit {
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

ngAfterViewInit(): void {

  setTimeout(() => {
    const pendingPage = localStorage.getItem('pendingNavPage');
    if (pendingPage) {
      localStorage.removeItem('pendingNavPage');
      const page = Number(pendingPage);
      this.pageNumber = page;
      this.navigateToPage(page);
    } else {
      this.pageNumber = 1;
    }

    this.resetDrawing();

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

  const index = event.startPosition ?? 0;

  const newPage = index + 1;

  if (newPage === this.lastPageProcessed) return;

  this.lastPageProcessed = newPage;

  this.renderPage(newPage);
}


private renderPage(page: number): void {

  this.pageNumber = page;

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

  @ViewChild('menu') contextMenu!: ContextMenu;
  @ViewChild(CarouselComponent) carousel!: CarouselComponent;

  // Quick Go To
  goToOpen   = false;
  goToMode: 'page' | 'sura' | 'aya' = 'page';
  goToPage   = 1;
  goToSuraIndex  = 1;
  goToAyaIndex   = 1;
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
    autoHeight: true,
    dots: false,
    navSpeed: 700,
    navText: ["", ""],
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
    nav: true,
  };


  showBookmarkDialog = false;
  bookmarkNote = '';

  constructor(private _searchInstance: Search, private _http: HttpClient, private _bookmarkService: BookmarkService) { }

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

  groupQuranPages(): any[] {
    // Create slides so that each slide contains ayat from a single sura.
    // We iterate over the ayat and start a new slide whenever the page number or sura changes.
    // Then we sort slides by the sura number to match Mushaf order.
    const slides: any[] = [];
    let currentSlide: any = null;

    this._searchInstance.table_othmani.forEach((aya) => {
      const pageNum = Number(aya.nOFPage);
      const suraName = aya.Sura_Name;
      const suraNumber = Number(aya.nOFSura) || 0;

      if (!currentSlide || currentSlide.pageNumber !== pageNum || currentSlide.suraName !== suraName) {
        // Default isSuraStart: true when aya index 1 is on this page (first aya of sura)
        const isFirstAya = Number(aya.Aya_N) === 1;
        currentSlide = {
          pageNumber: pageNum,
          suraName: suraName,
          suraNumber: suraNumber,
          isSuraStart: isFirstAya,
          ayat: [],
        };
        slides.push(currentSlide);
      }

      currentSlide.ayat.push({
        id: aya.id,
        text: aya.AyaText_Othmani,
        ayaNumber: aya.Aya_N,
        suraName: suraName,
        highlighted: false,
        matchedWord: '',
        arrOfColoredWords: []
      });
    });

    // Sort slides by suraNumber (Mushaf order), then by pageNumber to preserve natural order within same sura.
    slides.sort((a, b) => {
      if ((a.suraNumber || 0) !== (b.suraNumber || 0)) {
        return (a.suraNumber || 0) - (b.suraNumber || 0);
      }
      return (a.pageNumber || 0) - (b.pageNumber || 0);
    });

    return slides;
  }

  toggleHighlight(aya: any) {
    aya.highlighted = !aya.highlighted;
    this.onClick.emit(aya)
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

  confirmBookmark(): void {
    this._bookmarkService.saveBookmark(this.selectedAya, this.bookmarkNote);
    this.showBookmarkDialog = false;
  }


  loadQuranPages(): void {
    this._http.get<any>(QuranPagesURL).subscribe((response) => {
      this._quranPages = response;
      this.generateMotashabehatOfSelectedPage(this.pageNumber);
      this.determineHighlight();
      this.drawColoredWords();
    });

    if (!this._pagesWithLines.length) {
      this._http.get<any[]>(QuranPagesWithLinesURL).subscribe((data) => {
        this._pagesWithLines = data;
        this.buildMushafLinesForCurrentPage();
      });
    }
  }

  loadQuranJson(): void {
    this._http.get<any>(QuranInJsonURL).subscribe((response) => {
      this._quranInJson = response;
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
            if (aya.text_without_tashkeel.startsWith(this.searchWord)) {
              this.x.push({
                id: ayaInPage.id,
                errorFactor: ayaInPage.errorFactor,
                top: ayaInPage.top,
                text: aya.text_without_tashkeel,
                index: aya.index,
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
              });
            });
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
              });
            });
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
                
              });
            });
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
                });
              });
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
  }
});

    // console.log(`generated motsahbeh: ${JSON.stringify(this.inputs)}`);
    // console.table(this.inputs);

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
    this.motshabehat.emit(this.inputs);

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

  // ── Mushaf line rendering ───────────────────────────────────────────────────

  private buildMushafLinesForCurrentPage(): void {
    if (!this._pagesWithLines.length) return;
    const pageData = this._pagesWithLines[this.pageNumber - 1];
    if (!pageData || !pageData.lines) return;
    this.quranPages
      .filter(slide => slide.pageNumber === this.pageNumber)
      .forEach(slide => this.buildMushafLines(slide, pageData.lines));
  }

  private buildMushafLines(slide: any, lines: any[]): void {
    const suraNum = slide.suraNumber;
    const ayaLookup = new Map<string, any>();
    slide.ayat.forEach((aya: any) => ayaLookup.set(String(aya.ayaNumber), aya));

    // Determine if this slide's sura starts on this page
    slide.isSuraStart = lines.some((line: any) =>
      line.isSuraStart && line.segments.some((seg: any) => Number(seg.verseKey.split(':')[0]) === suraNum)
    );

    // Pre-compute the last line index that contains each verseKey
    const lastLineForVerse = new Map<string, number>();
    lines.forEach((line: any, li: number) => {
      line.segments.forEach((seg: any) => {
        if (Number(seg.verseKey.split(':')[0]) === suraNum) {
          lastLineForVerse.set(seg.verseKey, li);
        }
      });
    });

    // Track how many words of each aya have been placed on previous lines
    const consumed = new Map<string, number>();
    const mushafLines: any[] = [];

    lines.forEach((line: any, li: number) => {
      const suraSegments = line.segments.filter(
        (seg: any) => Number(seg.verseKey.split(':')[0]) === suraNum
      );
      if (!suraSegments.length) return;

      const lineSegments: any[] = [];

      suraSegments.forEach((seg: any) => {
        const ayaNum = seg.verseKey.split(':')[1];
        const aya = ayaLookup.get(ayaNum);
        if (!aya) return;

        const words: string[] = aya.text.split(' ');
        const coloredWords: any[] = aya.arrOfColoredWords || [];
        const from = consumed.get(seg.verseKey) || 0;
        const isLastSegment = lastLineForVerse.get(seg.verseKey) === li;

        // On the last occurrence, take all remaining words (handles word count mismatches)
        const to = isLastSegment ? words.length : Math.min(from + seg.wordPositions.length, words.length);
        consumed.set(seg.verseKey, to);

        if (from >= words.length) return;

        const lineWords = words.slice(from, to);
        const lineColoredWords = lineWords.map((w: string, i: number) => ({
          word: w,
          color: (from + i) < coloredWords.length ? (coloredWords[from + i]?.color || '') : ''
        }));

        const cleanColoredWords = lineColoredWords.map((cw: any) => ({
          ...cw,
          word: this.stripQuranicMarks(cw.word)
        }));
        lineSegments.push({ aya, lineText: this.stripQuranicMarks(lineWords.join(' ')), lineColoredWords: cleanColoredWords, isAyaEnd: isLastSegment });
      });

      if (lineSegments.length) {
        mushafLines.push({ segments: lineSegments, isCentered: line.isSuraStart || line.isBasmala });
      }
    });

    slide.mushafLines = mushafLines;
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
