import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, debounceTime, distinctUntilChanged, filter } from 'rxjs';
// import { DataService } from 'src/app/dashboard/todo-list/services/getDataSearch.service';
import { } from 'stream';
const regex = /([\u0600-\u06FF])ِى/g; // to replace any arabic character followed by this char ِ and (ى) with (ي) 
const HAMZATWASL = /[\u0671]/g;
const SMALLALEF = /[\u0670]/g;
const ARABIC_CHARS_REG = /[\u0621-\u064A\s]+/g;
const searchURL = "assets/jsonData/searchJson.json";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  results: string[] = [];
  searchWord!: string;
  hasTashkeel: boolean = false;

  constructor(private _router: Router, private _http: HttpClient) { }

  ngOnInit() {

  }

  search(event: any) {
    this.results = [];
    let word = event.data;
    word = this.applyTaskeelRegex(word)
    this.hasTashkeel = false;
    this.results.push("")
    this._http.get<any>(searchURL).subscribe(response => {
      response.forEach((aya: any) => {
        if (aya.AyaText.includes(word)) {
          this.results.push(aya.AyaText_Othmani)
        }
      });

    });
  }

  test(){
    console.log("fgf")
  }

  applyTaskeelRegex(searchWord: string) {
    searchWord = searchWord.replace(regex, '$1ي');
    searchWord = searchWord.replace(/([ء-ي])َىْ/g, '$1ي'); // شَىْءٍ - شيء
    searchWord = searchWord.replace(/سَوَّىٰ([ء-ي]+)/g, 'سَوَّا$1'); // فَسَوَّىٰهُنَّ فسواهن
    searchWord = searchWord.replace('ٱلْحَيَوٰ', "الحيا");
    searchWord = searchWord.replace("ـَٔاي", "آي");//replace "بِـَٔايَٰتِنَا" "بآياتنا " 
    searchWord = searchWord.replace('ـَٰٔ', "آ");//replace small Alef to Alef ـَٰٔ
    searchWord = searchWord.replace(HAMZATWASL, "ا");//replace small Alef to Alef
    searchWord = searchWord.replace(SMALLALEF, "ا");
    searchWord = searchWord.replace("الَّيْل", "الليل");
    searchWord = searchWord.replace(/([\u0600-\u06FF])ىا/g, "ى");//replace small Alef to Alef
    searchWord = searchWord.replace(/ـُٔ/g, "ئ");//replace "لَيَـُٔوسٌ"
    searchWord = searchWord.replace("ـَٔا", "ئا");//replace "يَسْـَٔلُونَكَ" "يسألونك " - "سَيِّـَٔاتِهِمْ " "سيئاتهم "
    searchWord = searchWord.replace("ـَٔ", "أ");//replace "يَسْـَٔلُونَكَ" "يسألونك " - "يَسْـَٔمُ " "يسأم "
    searchWord = searchWord.replace("عُمْىٌ", "عمي"); // عُمْىٌ
    searchWord = searchWord.replace("هُدَاىَ", "هداي"); // 
    const match = searchWord.match(ARABIC_CHARS_REG);
    searchWord = match && match.join('').trim() || "";
    searchWord = searchWord.replace(/وىٰ/g, "وا"); // ياأيها
    searchWord = searchWord.replace(/ءا/g, 'آ');// آمن
    searchWord = searchWord.replace(/ذالك/g, "ذلك");//replace small Alef to Alef
    searchWord = searchWord.replace(/أولائك/g, "أولئك");//replace small Alef to Alef
    searchWord = searchWord.replace(/لاكن/g, "لكن");//replace small Alef to Alef
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
    searchWord = searchWord.replace(/([\u0600-\u06FF]|)وإلاه(|[\u0600-\u06FF])/g, "وإله"); //     
    searchWord = searchWord.replace(/([\u0600-\u06FF]|)إلاه(|[\u0600-\u06FF])/g, "إله"); //     
    searchWord = searchWord.replace(/([\u0600-\u06FF]&&)ى(&&[\u0600-\u06FF])/g, ""); //     
    return searchWord;
  }

}
