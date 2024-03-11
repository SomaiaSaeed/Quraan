import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Search } from "src/app/core/services/search.service";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";

interface Aya {
  id: string;
  Sura_Name: string;
  AyaText_Othmani: string;
  AyaText: string;
  Aya_N: string;
  nOFSura: string;
  suraStart: string;
  rub: string;
  joz: string;
  nOFJoz: string;
  hezb: string;
  nOFHezb: string;
  nOFPage: string;
  rubStart: string;
  pageStart: string;
}
interface SuraInfo {
  soraName: string;
  nOFSura: string;
  nOfAyas: number;
}

interface PartInfo {
  nOFJoz: any;
  elPart: string;
}

interface HezbInfo {
  nOFHezb: string;
}

interface PageInfo {
  nOFPage: string;
}

interface RobInfo {
  rub: string;
  ayaId: string; // Assuming 'id' is a string; adjust the type accordingly
}

interface AyaNumbersOfSura {
  id: number;
}

interface SuraEvent {
  value: {
    nOFSura: string;
    nOfAyas: number;
  };
}
interface SearchSetting {
  key: string;
  finder: string;
  finderKey: string;
}
@Component({
  selector: "app-form",
  templateUrl: "./form.component.html",
  styleUrls: ["./form.component.scss"],
})
export class FormComponent implements OnInit {
x($event: any) {
  ;
  // this.toppings.valueChanges.subscribe((selectedValues) => {
    this.saveToLocalStorage("dynamic_cols", $event);
  // });
throw new Error('Method not implemented.');
}
  toppings = new FormControl("");
  resultsList: string[] = [
    "رقم_السورة",
    "بداية_السورة",
    "الربع",
    "رقم_الجزء",
    "الحزب",
    "رقم_الحزب",
    "رقم_الصفحة",
    "بداية_الربع",
    "بداية_الصفحة",
    "اسم_السورة",
    "الآية",
  ];

  // Assuming these are declared elsewhere in the class
  parts: PartInfo[] = [];
  hezb: HezbInfo[] = [];
  pages: PageInfo[] = [];
  rob: RobInfo[] = [];
  soras: SuraInfo[] = [];
  _search: Search = new Search();
  fromSoraAyat: AyaNumbersOfSura[] = [];
  toSoraAyat: AyaNumbersOfSura[] = [];

  soar: any[] = [
    { name: "التصنيف", code: "1" },

    { name: "السور", code: "2" },
    { name: "elPart", code: "3" },
  ];
  result: any[] = [];
  omomQuraan_AyaStart: string = "generalQuran";
  orderResultBy: string = "mushafOrder";
  soraSelected: boolean = false;
  partSelected: boolean = false;
  fromSora: any = {};
  toSora: any = {};
  fromPart: any = {};
  toPart: any = {};
  fromAya: any = {};
  toAya: any = {};
  fromRob: any = {};
  toRob: any = {};
  fromHezp: any = {};
  toHezp: any = {};
  fromPage: any = {};
  toPage: any = {};
  results!: string[];
  currentIndex!: number;
  repeated!: boolean;
  teamInitial = " ";
  isOpen: boolean = false;
  @ViewChild("searchResult", { static: true }) searchResult: ElementRef | any;
  idintical: boolean = false;
  selectedFromSora: any;
  selectedToSora: SuraInfo | undefined;
  selectedFromPart: PartInfo | undefined;
  selectedToPart: PartInfo | undefined;
  selectedFromHezp: HezbInfo | undefined;
  selectedToHezp: HezbInfo | undefined;
  selectedFromRob: RobInfo | undefined;
  selectedToRob: RobInfo | undefined;
  selectedFromPage: PageInfo | undefined;
  selectedToPage: PageInfo | undefined;
  omomQuraan: any;
  alphabitcalOrder: any;
  selectedToAya: AyaNumbersOfSura | undefined;
  selectedFromAya: AyaNumbersOfSura | undefined;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initializeEmptyArrays();
    this.processTableOthmani();
    this.loadSavedSearchSettings();
  }

  loadSavedSearchSettings(){
   
    let savedSettingsJson = localStorage.getItem("result");
    if(savedSettingsJson) {
      let savedSettings = JSON.parse(savedSettingsJson);
      let{
        fromSora,toSora,fromPart, toPart,fromHezp,toHezp,
        fromRob,toRob,fromPage,toPage,fromAya,toAya,
        searchIn,orderBy,idintical } = savedSettings;
      this.fromSora = fromSora;
      this.selectedFromSora = this.soras.find( sora => sora.nOFSura == fromSora);
      if(this.selectedFromSora){this.fromSoraAyat = this.populateSoraAyat(this.selectedFromSora.nOfAyas);
        this.selectedFromAya = this.fromSoraAyat.find( ayat => ayat.id == fromAya)
        this.fromAya = fromAya;
      }
      
      this.toSora = toSora;
      this.selectedToSora = this.soras.find( sora => sora.nOFSura == toSora)
      if(this.selectedToSora){this.toSoraAyat = this.populateSoraAyat(this.selectedToSora.nOfAyas);
        this.selectedToAya = this.toSoraAyat.find( ayat => ayat.id == toAya)
        this.toAya = toAya;
      }
      this.fromPart = fromPart;
      this.selectedFromPart = this.parts.find( part => part.elPart == fromPart)
      this.toPart = toPart;
      this.selectedToPart = this.parts.find( part => part.elPart == toPart)
      this.fromHezp = fromHezp;
      this.selectedFromHezp = this.hezb.find( hez => hez.nOFHezb == fromHezp)
      this.toHezp = toHezp;
      this.selectedToHezp = this.hezb.find( hez => hez.nOFHezb == toHezp)
      this.fromRob = fromRob;
      this.selectedFromRob = this.rob.find( r => r.rub == fromRob)
      this.toRob = toRob;
      this.selectedToRob = this.rob.find( r => r.rub == toRob)
      this.fromPage = fromPage;
      this.selectedFromPage = this.pages.find( page => page.nOFPage == fromPage)
      this.toPage = toPage;
      this.selectedToPage = this.pages.find( page => page.nOFPage == toPage)
      this.fromAya = fromAya;
      this.omomQuraan_AyaStart = searchIn;
      this.orderResultBy = orderBy;
      this.idintical = idintical;

    } 
    let dynamicCols = localStorage.getItem("dynamic_cols");
    if(dynamicCols){
      
      this.toppings.setValue(JSON.parse(dynamicCols));
    }

  }

  private initializeEmptyArrays() {
    this.parts = [];
    // this.texts = [];
    this.soras = [];
    this.hezb = [];
    this.pages = [];
    this.rob = [];
    this.fromSoraAyat = [];
    this.toSoraAyat = [];
  }

  private processTableOthmani() {
    let currentSura = "الفاتحة";
    let nOfAyas = 0;

    this._search.table_othmani.forEach((aya: Aya) => {
      this.updateSuraInfo(aya, currentSura, nOfAyas);
      this.addUniqueItem(this.parts, aya.nOFJoz, "elPart");
      this.addUniqueItem(this.hezb, aya.nOFHezb, "nOFHezb");
      this.addUniqueItem(this.pages, aya.nOFPage, "nOFPage");
      this.addUniqueItem(this.rob, aya.rub, "rub", { ayaId: aya.id });

      nOfAyas = currentSura === aya.Sura_Name ? nOfAyas + 1 : 1;
      currentSura = aya.Sura_Name;
    });
  }

  private updateSuraInfo(
    aya: { Sura_Name: any; nOFSura: string },
    currentSura: string,
    nOfAyas: number
  ) {
    if (currentSura !== aya.Sura_Name) {
      this.soras.push({
        soraName: currentSura,
        nOFSura: (parseInt(aya.nOFSura) - 1).toString(),
        nOfAyas: nOfAyas,
      });
    }
  }

  private addUniqueItem(array: {}[], value: any, key: string, extraData = {}) {
    const index = array.findIndex(
      (item: { [x: string]: any }) => item[key] === value
    );
    if (index < 0) {
      array.push({
        [key]: value,
        ...extraData,
      });
    }
  }

  toSoraFun($event: SuraEvent) {
    this.toSora = $event.value.nOFSura;

    if (this.toSora) {
      this.resetArrays();
      this._search.table_othmani.forEach((aya: Aya) => {
        if (this.isWithinSuraRange(aya.nOFSura)) {
          this.addToUniqueArray(this.parts, {
            elPart: aya.nOFJoz,
            nOFJoz: undefined
          }, "elPart");
          this.addToUniqueArray(this.hezb, { nOFHezb: aya.nOFHezb }, "nOFHezb");
          this.addToUniqueArray(
            this.pages,
            { nOFPage: aya.nOFPage },
            "nOFPage"
          );
          this.addToUniqueArray(
            this.rob,
            { rub: aya.rub, ayaId: aya.id },
            "rub"
          );
        }
      });

     this.toSoraAyat = this.populateSoraAyat($event.value.nOfAyas);
    }
  }

  private resetArrays() {
    this.parts = [];
    this.hezb = [];
    this.pages = [];
    this.rob = [];
    this.toSoraAyat = [];
    
    this.fromPart = null;
    this.toPart = null;
    this.fromHezp = null;
    this.toHezp = null;
    this.fromRob = null;
    this.toRob = null;
    this.fromPage = null;
    this.toPage = null;
    this.fromAya = null;
    this.toAya = null;
  }

  private isWithinSuraRange(nOFSura: string) {
    const suraNum = parseInt(nOFSura);
    return (
      suraNum <= parseInt(this.toSora) && suraNum >= parseInt(this.fromSora)
    );
  }

  private addToUniqueArray<T>(array: T[], newValue: T, compareKey: keyof T) {
    if (!array.some((item) => item[compareKey] === newValue[compareKey])) {
      array.push(newValue);
    }
  }

  private populateSoraAyat(nOfAyas: number) {
    let soraAyat = [];
    for (let index = 1; index <= nOfAyas; index++) {
      soraAyat.push({ id: index });
    }
    return soraAyat;
  }

  fromSoraFun($event: SuraEvent) {
    ;
    console.log('Selected Sora:', this.selectedFromSora);

    this.fromSora = $event.value.nOFSura;
    this.fromSoraAyat = this.populateSoraAyat($event.value.nOfAyas);
  }

  fromAyaFun($event: any) {
    this.fromAya = $event.value.id;
  }

  toAyaFun($event: any) {
    this.toAya = $event.value.id;
  }

  fromRobFun($event: any) {
    this.fromRob = $event.value.rub;
  }

  toRobFun($event: any) {
    this.toRob = $event.value.rub;
    ;
  }

  fromHezpFun($event: any) {
    this.fromHezp = $event.value.nOFHezb;
  }

  toHezpFun($event: any) {
    this.toHezp = $event.value.nOFHezb;
  }

  fromPageFun($event: any) {
    this.fromPage = $event.value.nOFPage;
    // this.fromPart = $event.value.elPart;
  }

  toPageFun($event: any) {
    this.toPage = $event.value.nOFPage;
    // this.fromPart = $event.value.elPart;
  }

  fromPartFun($event: any) {
    this.fromPart = $event.value.elPart;
  }

  toPartFun($event: any) {
    this.toPart = $event.value.elPart;
  }

  rest() {
    this.fromSora = null;
    this.toSora = null;
    this.fromPart = null;
    this.toPart = null;
    this.fromHezp = null;
    this.toHezp = null;
    this.fromRob = null;
    this.toRob = null;
    this.fromPage = null;
    this.toPage = null;
    this.fromAya = null;
    this.toAya = null;
    this.omomQuraan_AyaStart = "generalQuran";
    this.orderResultBy = "mushafOrder";
    this.idintical = false;
  }

  saveSearchSettings(): void {
    ;

    const result = {
      fromSora: this.fromSora,
      toSora: this.toSora,
      fromPart: this.fromPart,
      toPart: this.toPart,
      fromHezp: this.fromHezp,
      toHezp: this.toHezp,
      fromRob: this.fromRob,
      toRob: this.toRob,
      fromPage: this.fromPage,
      toPage: this.toPage,
      fromAya: this.fromAya,
      toAya: this.toAya,
      searchIn: this.omomQuraan_AyaStart,
      orderBy: this.orderResultBy,
      idintical: this.idintical,
    };

    // Consider abstracting localStorage operations into a service or utility function.
    this.saveToLocalStorage("result", result);

    const dialogRef = this.dialog.open(this.searchResult, {
      width: "500px",
      panelClass: "popup-center",
    });
  }

  private saveToLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  searchIn(e: any) {
    this.omomQuraan_AyaStart = e.value;
  }

  orderBy(e: any) {
    this.orderResultBy = e.value;
  }

  OnIdinticalChange(e: any) {
    this.idintical = e.checked;
  }
}
