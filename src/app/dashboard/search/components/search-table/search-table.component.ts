import { Component, OnInit } from '@angular/core';
import { DataSharingService } from '../../services/data-sharing.service';

@Component({
  selector: 'app-search-table',
  templateUrl: './search-table.component.html',
  styleUrls: ['./search-table.component.scss']
})
export class SearchTableComponent implements OnInit {
  selectedData?: { data: any[], result: any[] };
  data?:any[];

  constructor(private dataSharingService: DataSharingService) { }

  ngOnInit(): void {
    this.dataSharingService.selectedData$.subscribe(combinedData => {
      this.selectedData = combinedData;
      console.log("this.selectedData",this.selectedData.result)      
    });
  }
}
