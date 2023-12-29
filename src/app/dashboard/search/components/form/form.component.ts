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

@Component({
  selector: "app-form",
  templateUrl: "./form.component.html",
  styleUrls: ["./form.component.scss"],
})
export class FormComponent implements OnInit {
  toppings = new FormControl("");
  resultsList: string[] = [
    "رقم_السورة",
    "بداية_السورة",
    "الربع",
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
  @ViewChild("addMatrix", { static: true }) addMatrix: ElementRef | any;
  idintical: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initializeEmptyArrays();
    this.processTableOthmani();
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

      currentSura = aya.Sura_Name;
      nOfAyas = currentSura === aya.Sura_Name ? nOfAyas + 1 : 1;
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
          this.addToUniqueArray(this.parts, { elPart: aya.nOFJoz }, "elPart");
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

      this.populateSoraAyat($event.value.nOfAyas);
    }
  }

  private resetArrays() {
    this.parts = [];
    this.hezb = [];
    this.pages = [];
    this.rob = [];
    this.toSoraAyat = [];
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
    for (let index = 1; index <= nOfAyas; index++) {
      this.toSoraAyat.push({ id: index });
    }
  }

  fromSoraFun($event: SuraEvent) {
    this.fromSora = $event.value.nOFSura;
    this.fromSoraAyat = [];

    for (let index = 1; index <= $event.value.nOfAyas; index++) {
      this.fromSoraAyat.push({ id: index });
    }
  }

  fromAyaFun($event: any) {
    this.fromAya = $event.value.id;
  }

  toAyaFun($event: any) {
    this.toAya = $event.value.id;
  }

  fromRobFun($event: any) {
    this.fromRob = $event.value.ayaId;
  }

  toRobFun($event: any) {
    this.toRob = $event.value.ayaId;
  }

  fromHezpFun($event: any) {
    this.fromHezp = $event.value.nOFHezb;
  }

  toHezpFun($event: any) {
    this.toHezp = $event.value.nOFHezb;
  }

  fromPageFun($event: any) {
    this.fromPage = $event.value.nOFPage;
    this.fromPart = $event.value.elPart;
  }

  toPageFun($event: any) {
    this.toPage = $event.value.nOFPage;
    this.fromPart = $event.value.elPart;
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
    debugger;

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
    this.toppings.valueChanges.subscribe((selectedValues) => {
      this.saveToLocalStorage("dynamic_cols", selectedValues);
    });

    const dialogRef = this.dialog.open(this.addMatrix, {
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
