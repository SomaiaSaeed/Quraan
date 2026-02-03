import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DataSharingService } from '../../services/data-sharing.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-search-table',
  templateUrl: './search-table.component.html',
  styleUrls: ['./search-table.component.scss']
})
export class SearchTableComponent implements OnInit {
  selectedData?: { data: any[]};
  data?: any[];
  searchQuery: string = '';
  originalData: any[] = [];
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

  constructor(private dataSharingService: DataSharingService, private cdr: ChangeDetectorRef,private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    
    this.dataSharingService.selectedData$.subscribe(combinedData => {
      this.selectedData = combinedData;
      this.originalData = [...this.selectedData.data]; // shallow clone
      this.searchQuery = combinedData.searchQuery;
      console.log("this.selectedData", this.selectedData.data)
    });
  }


  onSortChange(event: any): void {
    const selectedSortType = event.target.value;
    console.log("Selected sort type:", selectedSortType);
    switch (selectedSortType) {
      case 'quranGeneral':
        this.sortByQuranGeneral();
        break;
      case 'startOfAyah':
        this.sortByStartOfAyah();
        break;
      default:
        break;
    }
    this.cdr.detectChanges();
  }
  onSortChange2(event: any): void {
    const selectedSortType = event.target.value;
    console.log("Selected sort type:", selectedSortType);
    switch (selectedSortType) {
      case 'alphabetical':
        this.sortAlphabetically();
        break;
      case 'mushafOrder':
        this.sortByMushafOrder();
        break;
      default:
        break;
    }
    this.cdr.detectChanges();
  }

  // sortByStartOfAyah(): void {
  //   console.log("Sorting by start of Ayah...");
  //   console.log("Data before sorting: ", this.selectedData?.data);
  //   if (this.selectedData?.data && this.selectedData.data.length > 0) {
  //     this.selectedData?.data.sort((a: any, b: any) => {
  //       const valueA = a.data?.AyaText_Othmani ? a.data.AyaText_Othmani.trim().toLowerCase() : '';
  //       const valueB = b.data?.AyaText_Othmani ? b.data.AyaText_Othmani.trim().toLowerCase() : '';
  //       if (valueA < valueB) return -1;
  //       if (valueA > valueB) return 1;
  //       return 0;
  //     });
  //   }
  //   console.log("Data after sorting: ", this.selectedData?.data);
  // }

  // sortByQuranGeneral(): void {
  //   console.log("Sorting by Quran General...");
  //   this.selectedData?.data.sort((a: any, b: any) => {
  //     if (a.data.nOFSura === b.data.nOFSura) {
  //       return parseInt(a.data.Aya_N) - parseInt(b.data.Aya_N);
  //     }
  //     return parseInt(a.data.nOFSura) - parseInt(b.data.nOFSura);
  //   });
  //   console.log(this.selectedData?.data);
  // }

  sortByStartOfAyah(): void {
    

    console.log("Sorting by start of Ayah with filter");
  
    if (!this.originalData.length) return;
  
    const query = this.searchQuery?.trim().toLowerCase();
  
    // 1️⃣ clone
    let clonedData = [...this.originalData];
  
    // 2️⃣ filter (startsWith)
    if (query) {
      clonedData = clonedData.filter(item => {
        const ayahText = item.data?.AyaText
          ?.trim()
          .toLowerCase();
  
        return ayahText?.startsWith(query);
      });
    }
  
    // 3️⃣ sort
    clonedData.sort((a: any, b: any) => {
      const valueA = a.data?.AyaText?.trim() ?? '';
      const valueB = b.data?.AyaText?.trim() ?? '';
      return valueA.localeCompare(valueB);
    });
  
    // 4️⃣ assign
    this.selectedData = {
      data: clonedData
    };
  
    console.log("Filtered & Sorted Data:", this.selectedData.data);
  }
  
  sortByQuranGeneral(): void {
    
    console.log("Reset to Quran General (original order)");
  
    if (!this.originalData.length) return;
  
    // رجّع نفس البيانات الأصلية
    this.selectedData = {
      data: [...this.originalData]
    };
  
    console.log(this.selectedData.data);
  }
  
  sortAlphabetically(): void {
    console.log("Sorting alphabetically...");
    console.log("Data before sorting: ", this.selectedData?.data);
    if (this.selectedData?.data && this.selectedData.data.length > 0) {
      this.selectedData?.data.sort((a: any, b: any) => {
        const valueA = a.data?.Sura_Name ? a.data.Sura_Name.trim().toLowerCase() : '';
        const valueB = b.data?.Sura_Name ? b.data.Sura_Name.trim().toLowerCase() : '';
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      });
    }
    console.log("Data after sorting alphabetically: ", this.selectedData?.data);
    this.cdr.detectChanges();
  }


  sortByMushafOrder(): void {
    console.log("Sorting by Mushaf Order...");
    console.log("Data before sorting: ", this.selectedData?.data);
    if (this.selectedData?.data && this.selectedData.data.length > 0) {
      this.selectedData?.data.sort((a: any, b: any) => {
        if (a.data?.nOFSura === b.data?.nOFSura) {
          return parseInt(a.data?.Aya_N) - parseInt(b.data?.Aya_N);
        }
        return parseInt(a.data?.nOFSura) - parseInt(b.data?.nOFSura);
      });
    }
    console.log("Data after sorting: ", this.selectedData?.data);
    this.cdr.detectChanges();
  }

  highlightText(text: string, search: string): SafeHtml {
    if (!search || search.trim() === '') {
      return text;
    }
  
    const regex = new RegExp(`(${search})`, 'gi');
    const highlightedText = text.replace(regex, `<span class="highlight">$1</span>`);
  
    console.log('Original:', text);
    console.log('Highlighted:', highlightedText);
  
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }
  

}
