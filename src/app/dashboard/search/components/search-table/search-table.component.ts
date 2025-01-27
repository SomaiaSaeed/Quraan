import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DataSharingService } from '../../services/data-sharing.service';

@Component({
  selector: 'app-search-table',
  templateUrl: './search-table.component.html',
  styleUrls: ['./search-table.component.scss']
})
export class SearchTableComponent implements OnInit {
  selectedData?: { data: any[], result: any[] };
  data?: any[];
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

  constructor(private dataSharingService: DataSharingService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.dataSharingService.selectedData$.subscribe(combinedData => {
      this.selectedData = combinedData;
      console.log("this.selectedData", this.selectedData.result)
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

  sortByStartOfAyah(): void {
    console.log("Sorting by start of Ayah...");
    console.log("Data before sorting: ", this.selectedData?.result);
    if (this.selectedData?.result && this.selectedData.result.length > 0) {
      this.selectedData?.result.sort((a: any, b: any) => {
        const valueA = a.data?.AyaText_Othmani ? a.data.AyaText_Othmani.trim().toLowerCase() : '';
        const valueB = b.data?.AyaText_Othmani ? b.data.AyaText_Othmani.trim().toLowerCase() : '';
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      });
    }
    console.log("Data after sorting: ", this.selectedData?.result);
  }

  sortByQuranGeneral(): void {
    console.log("Sorting by Quran General...");
    this.selectedData?.result.sort((a: any, b: any) => {
      if (a.data.nOFSura === b.data.nOFSura) {
        return parseInt(a.data.Aya_N) - parseInt(b.data.Aya_N);
      }
      return parseInt(a.data.nOFSura) - parseInt(b.data.nOFSura);
    });
    console.log(this.selectedData?.result);
  }

  sortAlphabetically(): void {
    console.log("Sorting alphabetically...");
    console.log("Data before sorting: ", this.selectedData?.result);
    if (this.selectedData?.result && this.selectedData.result.length > 0) {
      this.selectedData?.result.sort((a: any, b: any) => {
        const valueA = a.data?.Sura_Name ? a.data.Sura_Name.trim().toLowerCase() : '';
        const valueB = b.data?.Sura_Name ? b.data.Sura_Name.trim().toLowerCase() : '';
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      });
    }
    console.log("Data after sorting alphabetically: ", this.selectedData?.result);
    this.cdr.detectChanges();
  }


  sortByMushafOrder(): void {
    console.log("Sorting by Mushaf Order...");
    console.log("Data before sorting: ", this.selectedData?.result);
    if (this.selectedData?.result && this.selectedData.result.length > 0) {
      this.selectedData?.result.sort((a: any, b: any) => {
        if (a.data?.nOFSura === b.data?.nOFSura) {
          return parseInt(a.data?.Aya_N) - parseInt(b.data?.Aya_N);
        }
        return parseInt(a.data?.nOFSura) - parseInt(b.data?.nOFSura);
      });
    }
    console.log("Data after sorting: ", this.selectedData?.result);
    this.cdr.detectChanges();
  }

}
