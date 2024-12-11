// export class FormComponent implements OnInit {

//     soar: any[] = [
//       { name: 'التصنيف', code: '1' },
  
//       { name: 'السور', code: '2' },
//       { name: 'elPart', code: '3' },
  
//     ];
//     soras: any[] = [];
//     rob: any[] = [];
//     hezb: any[] = [];
//     fromSoraAyat: any[] = [];
//     toSoraAyat: any[] = [];
//     pages: any[] = [];
//     result: any[] = [];
//     omomQuraan: boolean = false;
//     soraSelected: boolean = false;
//     partSelected: boolean = false;
//     parts: any[] = [];
//     fromSora: any = {};
//     toSora: any = {};
//     fromPart: any = {};
//     toPart: any = {};
//     fromAya: any = {};
//     toAya: any = {};
//     fromRob: any = {};
//     toRob: any = {};
//     fromHezp: any = {};
//     toHezp: any = {};
//     fromPage: any = {};
//     toPage: any = {};
//     _search: Search = new Search();
//     texts!: string[];
//     results!: string[];
//     currentIndex!: number;
//     repeated!: boolean;
//     teamInitial = ' ';
//     isOpen: boolean = false;
  
//     constructor(private router: Router, private http: HttpClient) {
//     }
  
//     ngOnInit() {
//       this.parts = [];
//       this.texts = [];
//       this.soras.push({ soraName: '.', nOfAyas: 0 });
//       let currentSura = 'الفاتحة';
//       let nOfAyas = 0;
//       this._search.table_othmani.forEach(aya => {
//         if (currentSura == aya.Sura_Name) {
//           nOfAyas++;
//         } else {
//           this.soras.push({
//             soraName: currentSura,
//             nOFSura: (parseInt(aya.nOFSura) - 1).toString(),
//             nOfAyas: nOfAyas
//           });
//           currentSura = aya.Sura_Name;
//           nOfAyas = 1;
//         }
//       });
//       this.parts.push({ elPart: '.' });
//       this._search.table_othmani.forEach(aya => {
  
//         let index = this.parts.findIndex(sura => {
//           return aya.nOFJoz == sura.elPart;
//         });
  
//         if (index < 0) {
//           this.parts.push({
//             elPart: aya.nOFJoz,
  
//           });
//         }
//       });
//       this.hezb.push({ nOFHezb: '.' });
//       this._search.table_othmani.forEach(aya => {
  
//         let index = this.hezb.findIndex(sura => {
//           return aya.nOFHezb == sura.nOFHezb;
//         });
  
//         if (index < 0) {
//           this.hezb.push({
//             nOFHezb: aya.nOFHezb,
  
//           });
//         }
//       });
//       this.pages.push({
//         nOFPage: '.',
//       });
//       this._search.table_othmani.forEach(aya => {
  
//         let index = this.pages.findIndex(sura => {
//           return aya.nOFPage == sura.nOFPage;
//         });
  
//         if (index < 0) {
//           this.pages.push({
//             nOFPage: aya.nOFPage,
  
//           });
//         }
//       });
//       this.rob.push({
//         rub: '.',
  
//       });
//       this._search.table_othmani.forEach(aya => {
  
//         let index = this.rob.findIndex(sura => {
//           return aya.rub == sura.rub;
//         });
  
//         if (index < 0) {
//           this.rob.push({
//             rub: aya.rub,
//             ayaId: aya.id,
//           });
//         }
//       });
//       this.fromSoraAyat = [];
//       this.toSoraAyat = [];
//       this.toSoraAyat.push({ id: '.' });
//       this.fromSoraAyat.push({ id: '.' });
//     }
  
//     omomClicked($event: MouseEvent) {
//       this.omomQuraan = true;
//     }
//     ayaId = 5;
//     roow: any;
//     audioCount!: number;
  
//     sorats: any[] = [];
  
//     toSoraFun($event: any) {
//       this.toSora = $event.value.nOFSura;
  
//       if (this.toSora) {
//         this.parts = [];
//         this.hezb = [];
//         this.pages = [];
//         this.rob = [];
//         this.toSoraAyat = [];
  
  
//         this.parts.push({ elPart: '.' });
//         this.hezb.push({ nOFHezb: '.' });
//         this.rob.push({ rub: '.' });
//         this.pages.push({ nOFPage: '.' });
//         this.toSoraAyat.push({ id: '.' });
  
//         this._search.table_othmani.forEach(aya => {
  
//           if (parseInt(aya.nOFSura) <= parseInt(this.toSora) && parseInt(aya.nOFSura) >= parseInt(this.fromSora)) {
//             let index = this.parts.findIndex(sura => {
//               return aya.nOFJoz == sura.elPart;
//             });
  
//             if (index < 0) {
//               this.parts.push({
//                 elPart: aya.nOFJoz,
  
//               });
//             }
  
//             index = this.hezb.findIndex(sura => {
//               return aya.nOFHezb == sura.nOFHezb;
//             });
  
//             if (index < 0) {
//               this.hezb.push({
//                 nOFHezb: aya.nOFHezb,
  
//               });
//             }
  
//             index = this.pages.findIndex(sura => {
//               return aya.nOFPage == sura.nOFPage;
//             });
  
//             if (index < 0) {
//               this.pages.push({
//                 nOFPage: aya.nOFPage,
  
//               });
//             }
  
//             index = this.rob.findIndex(sura => {
//               return aya.rub == sura.rub;
//             });
  
//             if (index < 0) {
//               this.rob.push({
//                 rub: aya.rub,
//                 ayaId: aya.id,
//               });
//             }
  
//           }
  
//         });
//       }
//       let nOfAyas = $event.value.nOfAyas;
//       let index = 0;
//       while (index < nOfAyas) {
//         index++;
//         this.toSoraAyat.push({
//           id: index,
//         });
//       }
//       // this.result.push(this.toSora);
  
//     }
  
//     fromSoraFun($event: any) {
  
//       this.sorats = [];
//       let url = "http://api.alquran.cloud/v1/surah/" + $event.value.nOFSura;
//       this.http.get<any>(url).subscribe(res => {
//         this.audioCount = res.data.ayahs.length;
//         res.data.ayahs.forEach((aya: any) => {
//           this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.number;
//           this.sorats.push({ link: this.roow, title: aya.text, artist: 'اسـم القارئ' ,});
//           console.log("ayaaya",aya);
//         });
//       });
//       this.fromSora = $event.value.nOFSura;
  
  
//       this.fromSoraAyat = [];
//       this.fromSoraAyat.push({ id: '.' });
//       let nOfAyas = $event.value.nOfAyas;
//       let index = 0;
//       while (index < nOfAyas) {
//         index++;
//         this.fromSoraAyat.push({
//           id: index,
//         });
//       }
  
//     }
  
//     fromAyaFun($event: any) {
  
//       this.fromAya = $event.value.id;
//     }
//     ayat: any[] = []
//     toAyaFun($event: any) {
//       this.sorats = [];
//       this.ayat = [];
           
  
  
      
//       // Resetting toAya to the selected value from the event
//       this.toAya = $event.value.id;
    
//       // Ensure fromAya is a number and less than or equal to toAya
//       let fromAyaNum = parseInt(this.fromAya);
//       let toAyaNum = parseInt(this.toAya);
    
//       // Fetch the surah's ayahs using the correct API to get accurate ayah numbers
//       let surahUrl = "http://api.alquran.cloud/v1/surah/" + this.fromSora; // Fetch from the current surah
    
//       this.http.get<any>(surahUrl).subscribe(res => {
//         // Get the list of ayahs from the surah
//         let ayahs = res.data.ayahs;
    
//         // Filter the ayahs based on fromAya and toAya
//         let filteredAyahs = ayahs.filter((aya: any) => aya.numberInSurah >= fromAyaNum && aya.numberInSurah <= toAyaNum);
    
//         // Set the total number of Ayahs to play
//         this.audioCount = filteredAyahs.length;
    
//         // Construct the URLs for the ayah audio files
//         filteredAyahs.forEach((aya: any) => {
//           this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.number;
    
//           // Push the correct ayah audio link into sorats
//           this.sorats.push({
//             link: this.roow,
//             title: aya.text,  // Use the actual Ayah text
//             artist: 'اسـم القارئ'
//           });
//         });
//       });
//     }
    
  
//     fromRobFun($event: any) {
//       this.fromRob = $event.value.ayaId;
//       let url = "https://api.quran.com/api/v4/quran/verses/uthmani_simple?rub_number=" + $event.value.ayaId;
//       this.http.get<any>(url).subscribe(res => {
//         this.audioCount = res.verses.length;
//         res.verses.forEach((aya: any) => {
//           this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.id;
//           this.sorats.push(this.roow);
//           console.log(res);
//         });
//       });
  
//     }
  
//     toRobFun($event: any) {
//       this.toRob = $event.value.ayaId;
//       for (this.fromRob++; this.fromRob < this.toRob; this.fromRob++) {
//         let url = "http://api.quran.com/api/v4/quran/verses/uthmani_simple?rub_number=" + this.fromRob;
  
//         this.http.get<any>(url).subscribe(res => {
//           this.audioCount = res.verses.length;
//           res.verses.forEach((aya: any) => {
//             this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.id;
//             this.sorats.push(this.roow);
//             console.log(res);
//           });
//         });
//       }
  
//     }
  
//     fromHezpFun($event: any) {
//       this.fromHezp = $event.value.nOFHezb;
//       let url = "https://api.quran.com/api/v4/quran/verses/uthmani_simple?hizb_number=" + $event.value.nOFHezb;
  
//       this.http.get<any>(url).subscribe(res => {
//         this.audioCount = res.verses.length;
//         res.verses.forEach((aya: any) => {
//           this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.id;
//           this.sorats.push(this.roow);
//           console.log(res);
//         });
//       });
//     }
  
//     toHezpFun($event: any) {
//       this.toHezp = $event.value.nOFHezb;
//       for (this.fromHezp++; this.fromHezp < this.toHezp; this.fromHezp++) {
//         let url = "http://api.quran.com/api/v4/quran/verses/uthmani_simple?hizb_number=" + this.fromHezp;
  
//         this.http.get<any>(url).subscribe(res => {
//           this.audioCount = res.verses.length;
//           res.verses.forEach((aya: any) => {
//             this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.id;
//             this.sorats.push(this.roow);
//             console.log(res);
//           });
//         });
//       }
//     }
  
//     fromPageFun($event: any) {
  
//       this.fromPage = $event.value.nOFPage;
//       this.fromPart = $event.value.elPart;
//       let url = "http://api.quran.com/api/v4/quran/verses/uthmani_simple?page_number=" + $event.value.nOFPage;
  
//       this.http.get<any>(url).subscribe(res => {
//         this.audioCount = res.verses.length;
//         res.verses.forEach((aya: any) => {
//           this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.id;
//           this.sorats.push(this.roow);
//           console.log(res);
//         });
//       });
//     }
  
//     toPageFun($event: any) {
//       this.toPage = $event.value.nOFPage;
//       this.fromPart = $event.value.elPart;
//       for (this.fromPage++; this.fromPage < this.toPage; this.fromPage++) {
//         let url = "http://api.quran.com/api/v4/quran/verses/uthmani_simple?page_number=" + this.fromPage;
  
//         this.http.get<any>(url).subscribe(res => {
//           this.audioCount = res.verses.length;
//           res.verses.forEach((aya: any) => {
//             this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.id;
//             this.sorats.push(this.roow);
//             console.log(res);
//           });
//         });
//       }
  
//     }
  
//     fromPartFun($event: any) {
//       this.fromPart = $event.value.elPart;
//       let url = "http://api.alquran.cloud/v1/juz/" + $event.value.elPart;
//       this.http.get<any>(url).subscribe(res => {
//         this.audioCount = res.data.ayahs.length;
//         res.data.ayahs.forEach((aya: any) => {
//           this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.number;
//           this.sorats.push(this.roow);
//           console.log(res);
//         });
//       });
  
//     }
  
//     toPartFun($event: any) {
//       this.toPart = $event.value.elPart;
//       for (this.fromPart++; this.fromPart < this.toPart; this.fromPart++) {
//         let url = "http://api.alquran.cloud/v1/juz/" + this.fromPart;
  
//         this.http.get<any>(url).subscribe(res => {
//           this.audioCount = res.verses.length;
//           res.verses.forEach((aya: any) => {
//             this.roow = 'http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/' + aya.id;
//             this.sorats.push(this.roow);
//             console.log(res);
//           });
//         });
//       }
//     }
  
//     audio: any;
  
//     numberOfRepeated!: number;
//     count!: number;
  
//     onChange($event: any) {
  
//       this.texts.push($event);
//     }
//     wasatClicked($event: MouseEvent) {
//       // this.repeated = true;
//       // this.numberOfRepeated=3;
//       this.count = 0;
//     }
//     numberRepeatClicked(event: any) {
//       // this.repeated = true;
  
//       this.numberOfRepeated = event.target.value;
  
//       this.count = 0;
//     }
//     played!: boolean;
//     audioEnded(ayaNum: any) {
  
//       if (ayaNum < this.audioCount - 1) {
//         this.currentIndex = ayaNum + 1;
//         this.playNextAya(this.currentIndex);
//       }
//       if (ayaNum == this.audioCount - 1 && this.repeated || (ayaNum == this.audioCount - 1 && this.numberOfRepeated - 2 >= this.count)) {
//         this.count++;
//         let audio: any = document.getElementById("surahPlayer0");
//         audio.play();
//       }
//     }
  
  
//     playNextAya(ayaNum: any) {
  
//       let currentAudio: any = document.getElementById("surahPlayer" + ayaNum);
//       currentAudio.play();
//     }
  
//     onPlay(ayaNum: number) {
  
//       if (ayaNum != this.currentIndex + 1) {// handle manual play
//         for (let i = 0; i < this.audioCount; i++) {
//           if (i != ayaNum) {
//             let audio: any = document.getElementById("surahPlayer" + i);
//             audio.pause();
//             audio.currentTime = 0;
//           }
//         }
//       }
//     }
  
//     rest() {
//       this.sorats = [];
//       this.ayat = [];
//       this.audioCount = 0;
//       this.roow = '';
//     }
//   }













// <form class="tw-w-10/12 lg:tw-w-6/12 tw-m-auto tw-mt-8 tw-border tw-border-gray-200 tw-p-4">
//   <div class="flex-c-b tw-gap-8 tw-flex-col md:tw-flex-row">
//     <div class="tw-w-full md:tw-w-auto select-box tw-flex-1">
//       <label class="tw-text-xs tw-font-medium tw-mb-2 tw-block">اسم السورة</label>
//       <div class="flex-box tw-gap-2">
//         <mat-form-field appearance="outline"
//           class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0 tw-bg-white tw-rounded-md">
//           <mat-label class="tw-text-sm">من</mat-label>
//           <span matSuffix
//             class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//           <!-- من سورة" -->
//           <mat-select (selectionChange)="fromSoraFun($event)">
//             <mat-option *ngFor="let sora of soras; let i = index" [value]="sora">{{ sora.soraName }}</mat-option>
//           </mat-select>
//         </mat-form-field>

//         <!-- إلى سورة -->
//         <mat-form-field appearance="outline"
//           class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0 tw-bg-white tw-rounded-md">
//           <mat-label class="tw-text-sm">إلى</mat-label>
//           <span matSuffix
//             class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//           <mat-select (selectionChange)="toSoraFun($event)">
//             <mat-option *ngFor="let sora of soras; let i = index" [value]="sora">{{ sora.soraName }}</mat-option>
//           </mat-select>
//         </mat-form-field>
//       </div>
//     </div>
//     <div class="tw-w-full md:tw-w-auto select-box tw-flex-1">
//       <label class="tw-text-xs tw-font-medium tw-mb-2 tw-block">رقـم الاية</label>
//       <div class="flex-box tw-gap-2">
//         <!-- من اية -->
//         <mat-form-field appearance="outline"
//           class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0 tw-bg-white tw-rounded-md">
//           <mat-label class="tw-text-sm">من</mat-label>
//           <span matSuffix
//             class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//           <mat-select (selectionChange)="fromAyaFun($event)">
//             <mat-option *ngFor="let number of fromSoraAyat" [value]="number">{{
//               number.id
//               }}</mat-option>
//           </mat-select>
//         </mat-form-field>
//         <!-- إلى اية -->
//         <mat-form-field appearance="outline"
//           class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0 tw-bg-white tw-rounded-md">
//           <mat-label class="tw-text-sm">إلى</mat-label>
//           <span matSuffix
//             class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//           <mat-select (selectionChange)="toAyaFun($event)">
//             <mat-option *ngFor="let number of toSoraAyat" [value]="number">{{
//               number.id
//               }}</mat-option>
//           </mat-select>
//         </mat-form-field>
//       </div>
//     </div>
//   </div>
//   <!-- advanced search -->
//   <div *ngIf="isOpen" class="tw-mt-4 tw-border-t tw-border-gray-200 tw-pt-4 tw-space-y-3">
//     <div class="flex-c-b tw-gap-8 tw-flex-col md:tw-flex-row">
//       <div class="tw-w-full md:tw-w-auto select-box tw-flex-1">
//         <label class="tw-text-xs tw-font-medium tw-mb-2 tw-block"> الجـزء</label>
//         <div class="flex-box tw-gap-2">
//           <mat-form-field appearance="outline"
//             class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0  tw-rounded-md">
//             <mat-label class="tw-text-sm">من</mat-label>
//             <span matSuffix
//               class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//             <!-- من سورة" -->
//             <mat-select (selectionChange)="fromPartFun($event)">
//               <mat-option *ngFor="let part of parts; let i = index" [value]="part">{{ part.elPart }}</mat-option>
//             </mat-select>
//           </mat-form-field>

//           <!-- إلى سورة -->
//           <mat-form-field appearance="outline"
//             class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0  tw-rounded-md">
//             <mat-label class="tw-text-sm">إلى</mat-label>
//             <span matSuffix
//               class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//             <mat-select (selectionChange)="toPartFun($event)">
//               <mat-option *ngFor="let part of parts; let i = index" [value]="part">{{ part.elPart }}</mat-option>
//             </mat-select>
//           </mat-form-field>
//         </div>
//       </div>
//       <div class="tw-w-full md:tw-w-auto select-box tw-flex-1">
//         <label class="tw-text-xs tw-font-medium tw-mb-2 tw-block"> الحـزب</label>
//         <div class="flex-box tw-gap-2">
//           <mat-form-field appearance="outline"
//             class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0  tw-rounded-md">
//             <mat-label class="tw-text-sm">من</mat-label>
//             <span matSuffix
//               class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//             <!-- من سورة" -->
//             <mat-select (selectionChange)="fromHezpFun($event)">
//               <mat-option *ngFor="let h of hezb; let i = index" [value]="h">{{ h.nOFHezb }}</mat-option>
//             </mat-select>
//           </mat-form-field>

//           <!-- إلى سورة -->
//           <mat-form-field appearance="outline"
//             class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0  tw-rounded-md">
//             <mat-label class="tw-text-sm">إلى</mat-label>
//             <span matSuffix
//               class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//             <mat-select (selectionChange)="toHezpFun($event)">
//               <mat-option *ngFor="let h of hezb; let i = index" [value]="h">{{ h.nOFHezb }}</mat-option>
//             </mat-select>
//           </mat-form-field>
//         </div>
//       </div>
//     </div>
//     <div class="flex-c-b tw-gap-8 tw-flex-col md:tw-flex-row">
//       <div class="tw-w-full md:tw-w-auto select-box tw-flex-1">
//         <label class="tw-text-xs tw-font-medium tw-mb-2 tw-block"> الربـع</label>
//         <div class="flex-box tw-gap-2">
//           <mat-form-field appearance="outline"
//             class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0  tw-rounded-md">
//             <mat-label class="tw-text-sm">من</mat-label>
//             <span matSuffix
//               class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//             <!-- من سورة" -->
//             <mat-select (selectionChange)="fromRobFun($event)">
//               <mat-option *ngFor="let r of rob; let i = index" [value]="r">{{ r.rub }}</mat-option>
//             </mat-select>
//           </mat-form-field>

//           <!-- إلى سورة -->
//           <mat-form-field appearance="outline"
//             class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0  tw-rounded-md">
//             <mat-label class="tw-text-sm">إلى</mat-label>
//             <span matSuffix
//               class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//             <mat-select (selectionChange)="toRobFun($event)">
//               <mat-option *ngFor="let r of rob; let i = index" [value]="r">{{ r.rub }}</mat-option>
//             </mat-select>
//           </mat-form-field>
//         </div>
//       </div>
//       <div class="tw-w-full md:tw-w-auto select-box tw-flex-1">
//         <label class="tw-text-xs tw-font-medium tw-mb-2 tw-block"> الصفحة</label>
//         <div class="flex-box tw-gap-2">
//           <mat-form-field appearance="outline"
//             class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0  tw-rounded-md">
//             <mat-label class="tw-text-sm">من</mat-label>
//             <span matSuffix
//               class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//             <!-- من سورة" -->
//             <mat-select (selectionChange)="fromPageFun($event)">
//               <mat-option *ngFor="let page of pages; let i = index" [value]="page">{{ page.nOFPage }}</mat-option>
//             </mat-select>
//           </mat-form-field>

//           <!-- إلى سورة -->
//           <mat-form-field appearance="outline"
//             class="tw-w-full tw-flex-1 tw-mt-4 sm:tw-mt-0 tw-pb-0  tw-rounded-md">
//             <mat-label class="tw-text-sm">إلى</mat-label>
//             <span matSuffix
//               class="sfi sfi-arrow-down1 tw-text-gray-500 tw-font-medium tw-mt-[-5px] tw-block tw-text-xs"></span>
//             <mat-select (selectionChange)="toPageFun($event)">
//               <mat-option *ngFor="let page of pages; let i = index" [value]="page">{{ page.nOFPage }}</mat-option>
//             </mat-select>
//           </mat-form-field>
//         </div>
//       </div>
//     </div>
//   </div>
//   <!-- actions -->
//   <div class="tw-mt-5">
//     <button type="submit" (click)="isOpen = !isOpen"
//       class="tw-bg-secondColor tw-text-mainColor tw-font-bold hover:tw-text-white tw-h-10 tw-px-4 hover:tw-bg-[#AEC3AE] transition-du200 disabled:tw-bg-gray-200 disabled:tw-cursor-no-drop disabled:tw-text-gray-400">
//       بحث متقدم
//     </button>
//     <span class="tw-mx-1"></span>
//     <button type="submit" (click)="rest()"
//       class="tw-bg-secondColor tw-text-mainColor tw-font-bold hover:tw-text-white tw-h-10 tw-px-4 hover:tw-bg-[#AEC3AE] transition-du200 disabled:tw-bg-gray-200 disabled:tw-cursor-no-drop disabled:tw-text-gray-400">
//       إعادة تعيين
//     </button>
//   </div>
// </form>
// <!-- result -->
// <app-audio-player [data]="sorats"></app-audio-player>