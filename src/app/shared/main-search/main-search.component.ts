import { HttpClient } from "@angular/common/http";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatAutocomplete } from "@angular/material/autocomplete";
import { Router } from "@angular/router";

const regex = /([\u0600-\u06FF])ِى/g; // to replace any arabic character followed by this char ِ and (ى) with (ي)
const HAMZATWASL = /[\u0671]/g;
const SMALLALEF = /[\u0670]/g;
const ARABIC_CHARS_REG = /[\u0621-\u064A\s]+/g;
const searchURL = "assets/jsonData/searchJson.json";

@Component({
  selector: "app-main-search",
  templateUrl: "./main-search.component.html",
  styleUrls: ["./main-search.component.scss"],
})
export class MainSearchComponent implements OnInit {
  @ViewChild("addMatrix", { static: true }) addMatrix: ElementRef | any;
  @ViewChild('auto', { static: false }) autoComplete: MatAutocomplete| any;
  results: string[] = [];
  searchWord!: string;
  hasTashkeel: boolean = false;
  // public dialogRef: MatDialogRef<null>
  constructor(
    private _router: Router,
    private _http: HttpClient,
    public dialog: MatDialog
  ) {}

  ngOnInit() {}

  openSearchResult(): void {
    this.saveSearchToLocalStorage();

    const dialogRef = this.dialog.open(this.addMatrix, {
      width: "500px",
      panelClass: "popup-center",
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  search(event: any, inp: any): void {
          this.autoComplete.loading = false;

    if(event==="oldSearch") return;
    this.results = [];
    let word = inp.value;
    word = this.applyTaskeelRegex(word);
    this.searchWord = word;
    this.hasTashkeel = false;
    this._http.get<any>(searchURL).subscribe((response) => {
      response.forEach((aya: any) => {
        if (aya.AyaText.includes(word)) {
          this.results.push(aya.AyaText_Othmani);
        }
      });
    });
  }

  applyTaskeelRegex(searchWord: string) {
    searchWord = searchWord.replace(regex, "$1ي");
    searchWord = searchWord.replace(/([ء-ي])َىْ/g, "$1ي"); // شَىْءٍ - شيء
    searchWord = searchWord.replace(/سَوَّىٰ([ء-ي]+)/g, "سَوَّا$1"); // فَسَوَّىٰهُنَّ فسواهن
    searchWord = searchWord.replace("ٱلْحَيَوٰ", "الحيا");
    searchWord = searchWord.replace("ـَٔاي", "آي"); //replace "بِـَٔايَٰتِنَا" "بآياتنا "
    searchWord = searchWord.replace("ـَٰٔ", "آ"); //replace small Alef to Alef ـَٰٔ
    searchWord = searchWord.replace(HAMZATWASL, "ا"); //replace small Alef to Alef
    searchWord = searchWord.replace(SMALLALEF, "ا");
    searchWord = searchWord.replace("الَّيْل", "الليل");
    searchWord = searchWord.replace(/([\u0600-\u06FF])ىا/g, "ى"); //replace small Alef to Alef
    searchWord = searchWord.replace(/ـُٔ/g, "ئ"); //replace "لَيَـُٔوسٌ"
    searchWord = searchWord.replace("ـَٔا", "ئا"); //replace "يَسْـَٔلُونَكَ" "يسألونك " - "سَيِّـَٔاتِهِمْ " "سيئاتهم "
    searchWord = searchWord.replace("ـَٔ", "أ"); //replace "يَسْـَٔلُونَكَ" "يسألونك " - "يَسْـَٔمُ " "يسأم "
    searchWord = searchWord.replace("عُمْىٌ", "عمي"); // عُمْىٌ
    searchWord = searchWord.replace("هُدَاىَ", "هداي"); //
    const match = searchWord.match(ARABIC_CHARS_REG);
    searchWord = (match && match.join("").trim()) || "";
    searchWord = searchWord.replace(/وىٰ/g, "وا"); // ياأيها
    searchWord = searchWord.replace(/ءا/g, "آ"); // آمن
    searchWord = searchWord.replace(/ذالك/g, "ذلك"); //replace small Alef to Alef
    searchWord = searchWord.replace(/أولائك/g, "أولئك"); //replace small Alef to Alef
    searchWord = searchWord.replace(/لاكن/g, "لكن"); //replace small Alef to Alef
    searchWord = searchWord.replace(/الرحمان/g, "الرحمن");
    searchWord = searchWord.replace(/الصلواة/g, "الصلاة");
    searchWord = searchWord.replace(/ءأ/g, "أأ"); // أأنذرتهم
    searchWord = searchWord.replace(/الءا/g, "الآ"); // الآخر
    searchWord = searchWord.replace(/مستهزءون/g, "مستهزئون"); // مستهزءون
    searchWord = searchWord.replace(/ياأيها/g, "يا أيها"); // ياأيها
    searchWord = searchWord.replace(/هاذ/g, "هذ");
    searchWord = searchWord.replace(/هاؤلاء/g, "هؤلاء");
    searchWord = searchWord.replace(/يستحى/g, "يستحيي");
    searchWord = searchWord.replace(/يائادم/g, "يا آدم");
    searchWord = searchWord.replace("يابني", "يا بني"); //
    searchWord = searchWord.replace("ياقوم", "يا قوم"); //
    searchWord = searchWord.replace("ياموسى", "يا موسى"); //
    searchWord = searchWord.replace("وإياى", "وإياي"); //
    searchWord = searchWord.replace("إسراءيل", "إسرائيل"); //
    searchWord = searchWord.replace("الزكواة", "الزكاة"); //
    searchWord = searchWord.replace("ملاقوا", "ملاقو"); //
    searchWord = searchWord.replace("شيـا", "شيئا"); //
    searchWord = searchWord.replace("باءو", "باءوا"); //
    searchWord = searchWord.replace("النبين", "النبيين"); //
    searchWord = searchWord.replace("والصابـين", "والصابئين"); //
    searchWord = searchWord.replace("خاسـين", "خاسئين"); //
    searchWord = searchWord.replace("فاداراتم", "فادارأتم"); //
    searchWord = searchWord.replace("يحى", "يحيي"); // ؟؟؟؟
    searchWord = searchWord.replace("خطيأته", "خطيئته"); //
    searchWord = searchWord.replace("خزى", "خزي"); //
    searchWord = searchWord.replace("حيواة", "حياة"); //
    searchWord = searchWord.replace("ميكىل", "ميكال"); //
    searchWord = searchWord.replace("تتلوا", "تتلو"); //
    searchWord = searchWord.replace("يتلوا", "يتلو"); //
    searchWord = searchWord.replace("اشترىه", "اشتراه"); //
    searchWord = searchWord.replace(/إبراهم/g, "إبراهيم"); //
    searchWord = searchWord.replace(
      /([\u0600-\u06FF]|)وإلاه(|[\u0600-\u06FF])/g,
      "وإله"
    ); //
    searchWord = searchWord.replace(
      /([\u0600-\u06FF]|)إلاه(|[\u0600-\u06FF])/g,
      "إله"
    ); //
    searchWord = searchWord.replace(
      /([\u0600-\u06FF]&&)ى(&&[\u0600-\u06FF])/g,
      ""
    ); //
    return searchWord;
  }

  onSearchInputClick() {
    this.getLocal();
    throw new Error("Method not implemented.");
  }

  getLocal() {
    // If searchWord is not empty, return early.
    if (this.searchWord) {
      return;
    }

    const finalResultJson = localStorage.getItem("oldSearch");
    if (finalResultJson) {
      const finalResult = JSON.parse(finalResultJson);
      // this.autoComplete.filled = true;
      // this.autoComplete.loading = true;
      this.results = finalResult;
      this.autoComplete.click.emit('oldSearch');
    }
  }

  saveSearchToLocalStorage() {

    let old = localStorage.getItem("oldSearch");
    let oldSearch = old ? JSON.parse(old) : [];
    const isSearchFound = oldSearch.includes(this.searchWord);
    if (!isSearchFound) {
      oldSearch.push(this.searchWord);

      if (oldSearch.length > 10) {
        oldSearch.shift(); // Remove the oldest search term
      }
      localStorage.setItem("oldSearch", JSON.stringify(oldSearch));
    }
  }

  displayResults(){
    localStorage.setItem("searchResults", JSON.stringify(this.results));
    this.closeDialog();
    this._router.navigateByUrl("/search");
  }


}
